import {Express, NextFunction, Request, Response} from "express";
import DB, {WatcherEntryCollectionType, WatcherEntryDataType} from "./DB.js";
import { readFileSync } from "fs";
import WatcherEntry from "./WatcherEntry.js";
import Telescope from "./Telescope";
import {hostname} from "os";

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

    constructor(data: ErrorWatcherData) {
        super(WatcherEntryDataType.exceptions, data);
    }
}

export default class ErrorWatcher
{
    private error: Error

    public static setup()
    {
        process
            .on('uncaughtException', async error => {
                const watcher = new ErrorWatcher(error)

                await watcher.save()

                console.error(error)

                process.exit(1)
            });
    }

    constructor(error: Error) {
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
        })

        await DB.errors().save(entry);
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