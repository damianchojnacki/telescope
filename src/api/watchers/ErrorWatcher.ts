import {NextFunction, Request, Response} from "express"
import DB from "../DB.js"
import {readFileSync} from "fs"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import Telescope from "../Telescope.js"
import {hostname} from "os"

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

    public static setup(telescope: Telescope)
    {
        telescope.app.use(async (error: Error, request: Request, response: Response, next: NextFunction) => {
            const watcher = new ErrorWatcher(error, telescope.batchId)

            if(watcher.shouldIgnore()){
                next(error)

                return
            }

            await watcher.saveOrUpdate()

            next(error)
        })

        // catch async errors
        process
            .on('uncaughtException', async error => {
                const watcher = new ErrorWatcher(error, telescope.batchId)

                if(watcher.shouldIgnore()){
                    return
                }

                await watcher.saveOrUpdate()

                console.error(error)

                process.exit(1)
            })
    }

    constructor(error: Error, batchId?: string)
    {
        this.error = error
        this.batchId = batchId
    }

    private async getSameError()
    {
        const errors = (await DB.errors().get())

        const index = errors.findIndex(error => this.isSameError(error))
        const error = errors.find(error => this.isSameError(error))

        return {error, index};
    }

    private async saveOrUpdate()
    {
        const {error, index} = await this.getSameError()

        const entry = new ErrorWatcherEntry({
            hostname: hostname(),
            class: this.error.name,
            file: this.getFile(),
            message: this.error.message,
            trace: this.getStackTrace(),
            line: this.getLine(),
            line_preview: this.getLinePreview(),
            occurrences: (error?.content.occurrences ?? 0) + 1,
        }, this.batchId)

        error ? await DB.errors().update(index, entry) : await DB.errors().save(entry)
    }

    private isSameError(error: ErrorWatcherEntry): boolean
    {
        return error.content.class === this.error.name &&
            error.content.message === this.error.message &&
            error.content.file === this.getFile()
    }

    private shouldIgnore(): boolean
    {
        return ErrorWatcher.ignoreErrors.includes(this.error.constructor as ErrorConstructor)
    }

    private getFile(): string
    {
        return (this.error.stack?.split('\n')[1] ?? '').split('file://')[1] ?? ''
    }

    private getLine(): number
    {
        const line = (this.error.stack?.split('\n')[1] ?? '').split(':')

        return Number(line[line.length - 2])
    }

    private getLinePreview(): string[]
    {
        const path = this.getFile().split(':')[0] ?? ''

        const preview: any = {}

        const errorLine = this.getLine()

        path && readFileSync(path).toString().split('\n').forEach((line, index) =>
        {
            if (index > errorLine - 10 && index < errorLine + 10) {
                preview[index + 1] = line
            }
        })

        return preview
    }

    private getStackTrace(): object[]
    {
        const lines = this.error.stack?.split("\n") ?? []

        lines.shift()

        return lines.map((line) =>
        {
            const counters = line.split(':')

            return {
                file: line.trim(),
                line: Number(counters[counters.length - 2] ?? null)
            }
        })
    }
}