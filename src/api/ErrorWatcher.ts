import {NextFunction, Request, Response} from "express"
import DB from "./DB.js"
import {readFileSync} from "fs"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "./WatcherEntry.js"
import Telescope from "./Telescope"
import {hostname} from "os"
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "./RequestWatcher.js"

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
    collection = WatcherEntryCollectionType.exception

    constructor(data: ErrorWatcherData, batchId?: string)
    {
        super(WatcherEntryDataType.exceptions, data, batchId)
    }
}

export default class ErrorWatcher
{
    private error: Error
    private request?: Request
    private batchId?: string
    private startTime?: [number, number]

    constructor(error: Error, request?: Request, batchId?: string, startTime?: [number, number])
    {
        this.error = error
        this.request = request
        this.batchId = batchId
        this.startTime = startTime
    }

    public static setup(telescope: Telescope)
    {
        telescope.app.use(async (error: Error, request: Request, response: Response, next: NextFunction) =>
        {
            const watcher = new ErrorWatcher(error, request, telescope.batchId, telescope.startTime)

            await watcher.createRequestEntry()

            await watcher.save()

            next(error)
        })

        // catch async errors
        process
            .on('uncaughtException', async error =>
            {
                const watcher = new ErrorWatcher(error, undefined, telescope.batchId, telescope.startTime)

                await watcher.save()

                console.error(error)

                process.exit(1)
            })
    }

    private async save(): Promise<void>
    {
        const errors = (await DB.errors().get())

        const errorIndex = errors.findIndex(error => this.isSameError(error))
        const error = errors.find(error => this.isSameError(error))

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

        errorIndex > -1 ? await DB.errors().update(errorIndex, entry) : await DB.errors().save(entry)
    }

    private async createRequestEntry()
    {
        const entry = new RequestWatcherEntry({
            hostname: hostname(),
            method: this.request?.method as HTTPMethod,
            uri: this.request?.path,
            response_status: 500,
            duration: this.startTime ? RequestWatcher.getDurationInMs(this.startTime) : 0,
            ip_address: this.request?.ip,
            memory: RequestWatcher.getMemoryUsage(),
            payload: this.request ? RequestWatcher.getPayload(this.request) : {},
            headers: this.request?.headers ?? {},
            response: 'Server error',
        }, this.batchId)

        await DB.requests().save(entry)
    }

    private isSameError(error: ErrorWatcherEntry): boolean
    {
        return error.content.class === this.error.name &&
            error.content.message === this.error.message
    }

    private shouldIgnore(): boolean
    {
        return false
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