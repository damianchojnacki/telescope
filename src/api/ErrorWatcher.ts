import {Express, NextFunction, Request, Response} from "express";
import DB, {WatcherEntryCollectionType, WatcherEntryDataType} from "./DB.js";
import { readFileSync } from "fs";
import WatcherEntry from "./WatcherEntry.js";
import Telescope from "./Telescope";
import {hostname} from "os";
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "./RequestWatcher.js";

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

    constructor(data: ErrorWatcherData, batchId?: string) {
        super(WatcherEntryDataType.exceptions, data, batchId);
    }
}

export default class ErrorWatcher
{
    private batchId?: string
    private error: Error

    public static setup(telescope: Telescope)
    {
        process
            .on('uncaughtException', async error => {
                const watcher = new ErrorWatcher(error, telescope.batchId)

                telescope.request && await watcher.createRequestEntry(telescope.request)

                await watcher.save()

                console.error(error)

                process.exit(1)
            });
    }

    constructor(error: Error, batchId?: string) {
        this.batchId = batchId
        this.error = error
    }

    private async save(): Promise<void>
    {
        const entry = new ErrorWatcherEntry({
            hostname: hostname(),
            class: this.error.name,
            file: this.getFile(),
            message: this.error.message,
            trace: this.getStackTrace(),
            line: this.getLine(),
            line_preview: this.getLinePreview(),
            occurrences: 1,
        }, this.batchId)

        await DB.errors().save(entry);
    }

    private async createRequestEntry(request: Request)
    {
        const entry = new RequestWatcherEntry({
            hostname: hostname(),
            method: request.method as HTTPMethod,
            controllerAction: '',
            uri: request.path,
            response_status: 500,
            duration: 0,
            ip_address: request.ip,
            memory: RequestWatcher.getMemoryUsage(),
            payload: RequestWatcher.getPayload(request),
            headers: request.headers,
            response: 'Server Error',
        }, this.batchId)

        await DB.requests().save(entry);
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

        path && readFileSync(path).toString().split('\n').forEach((line, index) => {
            if(index > errorLine - 10 && index < errorLine + 10){
                preview[index + 1] = line
            }
        });

        return preview;
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
        });
    }
}