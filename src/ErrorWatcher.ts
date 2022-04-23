import { NextFunction, Request, Response } from "express";
import DB from "./DB.js";
import { v4 as uuidv4 } from 'uuid';

export interface ErrorWatcherData
{
  uuid: string,
  time: string,
  hostname: string,
  type: string,
  location: string,
  message: string,
  stacktrace: string
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
            uuid: uuidv4(),
            time: new Date().toISOString(),
            hostname: this.request.hostname,
            type: this.error.name,
            location: this.getLocation(),
            message: this.error.message,
            stacktrace: this.getStackTrace()
        });   
    }

    private shouldIgnore(): boolean
    {
        return false;
    }

    private getLocation(): string
    {
        return (this.error.stack?.split('\n')[1] ?? '').trim();
    }

    private getStackTrace(): string
    {
        return this.error.stack?.substring(this.error.stack?.indexOf("\n") + 1).trim() ?? ''
    }
}