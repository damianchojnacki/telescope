import {NextFunction, Request, Response} from "express"
import DB from "../DB.js"
import {existsSync, readFileSync} from "fs"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import Telescope from "../Telescope.js"
import {hostname} from "os"
import StackUtils from "stack-utils"

export interface ErrorWatcherData
{
    hostname: string
    class: string
    file: string
    message: string
    trace: object[]
    line_preview: object
    line: number
    occurrences: number
}

export class ErrorWatcherEntry extends WatcherEntry<ErrorWatcherData>
{
    constructor(data: ErrorWatcherData, batchId?: string)
    {
        super(WatcherEntryDataType.exceptions, data, batchId)
    }
}

export default class ErrorWatcher
{
    public static entryType = WatcherEntryCollectionType.exception
    public static ignoreErrors: ErrorConstructor[] = []

    private error: Error
    private batchId?: string

    constructor(error: Error, batchId?: string)
    {
        this.error = error
        this.batchId = batchId
    }

    public static setup(telescope: Telescope)
    {
        telescope.app.use(async (error: Error, request: Request, response: Response, next: NextFunction) => {
            try{
                const watcher = new ErrorWatcher(error, telescope.batchId)

                if (watcher.shouldIgnore()) {
                    next(error)

                    return
                }

                await watcher.saveOrUpdate()

                next(error)
            } catch(e) {
                next(e)
            }
        })

        // catch async errors
        process
            .on('uncaughtException', async error => {
                const watcher = new ErrorWatcher(error, telescope.batchId)

                if (watcher.shouldIgnore()) {
                    return
                }

                await watcher.saveOrUpdate()

                console.error(error)

                process.exit(1)
            })
    }

    private async getSameError()
    {
        const errors = (await DB.errors().get())

        const index = errors.findIndex(error => this.isSameError(error))
        const error = errors.find(error => this.isSameError(error))

        return {error, index}
    }

    public async saveOrUpdate()
    {
        const {error, index} = await this.getSameError()

        const entry = new ErrorWatcherEntry({
            hostname: hostname(),
            class: this.error.name,
            file: this.getFileInfo().file,
            message: this.error.message,
            trace: this.getStackTrace(),
            line: this.getFileInfo().line,
            line_preview: this.getLinePreview(),
            occurrences: (error?.content.occurrences ?? 0) + 1,
        }, this.batchId)

        error ? await DB.errors().update(index, entry) : await DB.errors().save(entry)
    }

    private isSameError(error: ErrorWatcherEntry): boolean
    {
        return error.content.class === this.error.name &&
            error.content.message === this.error.message &&
            error.content.file === this.getFileInfo().file
    }

    public shouldIgnore(): boolean
    {
        return ErrorWatcher.ignoreErrors.includes(this.error.constructor as ErrorConstructor)
    }

    private getFileInfo()
    {
        const utils = new StackUtils({cwd: process.cwd(), internals: StackUtils.nodeInternals()});

        const fileInfo = utils.parseLine(this.error.stack ? this.error.stack.split('\n')[1] : '');

        return {
            file: fileInfo?.file?.replace('file://', '') ?? '',
            line: fileInfo?.line ?? 0,
            column: fileInfo?.column ?? 0,
        }
    }

    private getLinePreview(): string[]
    {
        const fileInfo = this.getFileInfo()

        const preview: any = {}

        fileInfo.file && existsSync(fileInfo.file) && readFileSync(fileInfo.file).toString().split('\n').forEach((line, index) => {
            if (index > fileInfo.line - 10 && index < fileInfo.line + 10) {
                preview[index + 1] = line
            }
        })

        return preview
    }

    private getStackTrace(): object[]
    {
        const lines = this.error.stack?.split("\n") ?? []

        lines.shift()

        return lines.map((line) => {
            const counters = line.split(':')

            return {
                file: line.trim(),
                line: Number(counters[counters.length - 2] ?? null)
            }
        })
    }
}