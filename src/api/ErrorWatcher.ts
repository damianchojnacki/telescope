import { NextFunction, Request, Response } from "express";
import DB from "./DB.js";
import { v4 as uuidv4 } from 'uuid';
import { fsync, readFileSync } from "fs";

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

export default class ErrorWatcher
{
    private error: Error
    private request: Request

    public static capture(error: Error, request: Request, response: Response, next: NextFunction)
    {
        const watcher = new ErrorWatcher(error, request);

        if(watcher.shouldIgnore()){
            next()

            return;
        }

        next()

        watcher.save();
    }

    constructor(error: Error, request: Request)
    {
        this.error = error
        this.request = request
    }

    private save(): void
    {
        DB.errors().save({
            hostname: this.request.hostname,
            class: this.error.name,
            file: this.getFile(),
            message: this.error.message,
            trace: this.getStackTrace(),
            line: this.getLine(),
            line_preview: this.getLinePreview(),
            occurrences: 1,
        });   
    }

    private shouldIgnore(): boolean
    {
        return false
    }

    private getFile(): string
    {        
        return (this.error.stack?.split('\n')[1] ?? '').split('at file://')[1] ?? ''
    }

    private getLine(): number
    {
        const line = (this.error.stack?.split('\n')[1] ?? '').split(':')
        
        return Number(line[line.length - 2]) ?? null
    }

    private getLinePreview(): string[]
    {        
        const path = this.error.stack?.split('\n')[1]?.split('at file://')[1]?.split(':')[0] ?? ''

        const preview: any = {}

        const errorLine = this.getLine()

        readFileSync(path).toString().split('\n').forEach((line, index) => {
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