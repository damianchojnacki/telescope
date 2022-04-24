import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import DB from "./DB.js";
import { v4 as uuidv4 } from 'uuid';

export type HTTPMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface RequestWatcherData
{
  hostname: string
  method: HTTPMethod
  controllerAction: string
  middleware: string[]
  uri: string
  response_status: number
  duration: number
  ip_address: string
  memory: number
  payload: object
  headers: IncomingHttpHeaders
  session: object
  response: any
}

export default class RequestWatcher
{
    public static paramsToFilter = ['password', 'token', 'secret']
    public static ignorePaths = ['/telescope']

    private request: Request
    private response: Response
    private startTime: [number, number]

    public static capture(request: Request, response: Response, next: NextFunction)
    {
        const watcher = new RequestWatcher(request, response);

        if(watcher.shouldIgnore()){
            next()

            return;
        }

        watcher.interceptResponse();

        next()

        watcher.save();
    }

    constructor(request: Request, response: Response)
    {
        this.request = request
        this.response = response
        this.startTime = process.hrtime()
    }

    private save() {
        const request = this.request;
        
        DB.requests().save({
            hostname: request.hostname,
            method: request.method as HTTPMethod,
            controllerAction: '',
            middleware: [],
            uri: request.path,
            response_status: this.response.statusCode,
            duration: this.getDurationInMs(),
            ip_address: request.ip,
            memory: this.getMemoryUsage(),
            payload: this.getPayload(),
            headers: request.headers,
            response: this.response.locals.body ?? '',
            session: {}
        });
    }

    private getMemoryUsage(): number
    {
        return Math.round(process.memoryUsage().rss / 1024 / 1024);
    };

    private getDurationInMs(): number
    {
        const stopTime = process.hrtime(this.startTime);

        return Math.round(stopTime[0] * 1e6 + stopTime[1] / 1e6);
    }

    private getPayload(): object
    {
        return {
            ...this.request.query,
            ...this.getFilteredParams()
        }
    }

    private getFilteredParams(): object
    {
        Object.keys(this.request.params ?? {}).map((key) => this.filter(this.request.params, key))

        return this.request.params;
    }

    private filter(params: object, key: string): object 
    {
        if(params.hasOwnProperty(key) && RequestWatcher.paramsToFilter.includes(key)){
            return Object.assign(params, {[key]: '********'})
        }

        return params;
    }

    private shouldIgnore(): boolean
    {
        const checks = RequestWatcher.ignorePaths.map((path) => this.request.path.startsWith(path))

        return checks.includes(true)
    }

    private interceptResponse(): void 
    {
        const old = this.response.send;

        this.response.send = (body) => {
            this.response.locals.body = body;

            return old.call(this.response, body);
        };
    }
}