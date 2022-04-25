import {NextFunction, Request, Response} from "express";
import {IncomingHttpHeaders} from "http";
import DB, {WatcherEntryCollectionType, WatcherEntryDataType} from "./DB.js";
import WatcherEntry from "./WatcherEntry.js";
import {parse, stringify} from "flatted";
import {hostname} from "os";

export type HTTPMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface RequestWatcherData {
    hostname: string
    method: HTTPMethod
    controllerAction: string
    middleware?: string[]
    uri: string
    response_status: number
    duration: number
    ip_address: string
    memory: number
    payload: object
    headers: IncomingHttpHeaders
    session?: object
    response: any
}

export class RequestWatcherEntry extends WatcherEntry<RequestWatcherData> {
    collection = WatcherEntryCollectionType.request

    constructor(data: RequestWatcherData) {
        super(WatcherEntryDataType.requests, data);
    }
}

export default class RequestWatcher {
    public static paramsToFilter = ['password', 'token', 'secret']
    public static ignorePaths = ['/telescope']
    public static responseSizeLimit = 64

    private request: Request
    private response: Response
    private responseBody: any = ''
    private startTime: [number, number]
    private oldRedirect?: Function

    public static capture(request: Request, response: Response, next: NextFunction) {
        const watcher = new RequestWatcher(request, response);

        if (watcher.shouldIgnore()) {
            next()

            return;
        }

        watcher.interceptResponse();

        next()
    }

    constructor(request: Request, response: Response) {
        this.request = request
        this.response = response
        this.startTime = process.hrtime()
    }

    private save() {
        const entry = new RequestWatcherEntry({
            hostname: hostname(),
            method: this.request.method as HTTPMethod,
            controllerAction: '',
            uri: this.request.path,
            response_status: this.response.statusCode,
            duration: this.getDurationInMs(),
            ip_address: this.request.ip,
            memory: this.getMemoryUsage(),
            payload: this.getPayload(),
            headers: this.request.headers,
            response: this.responseBody,
        })

        DB.requests().save(entry);
    }

    private getMemoryUsage(): number {
        return Math.round(process.memoryUsage().rss / 1024 / 1024);
    };

    private getDurationInMs(): number {
        const stopTime = process.hrtime(this.startTime);

        return Math.round(stopTime[0] * 1000 + stopTime[1] / 1000000);
    }

    private getPayload(): object {
        return {
            ...this.request.query,
            ...this.getFilteredParams()
        }
    }

    private getFilteredParams(): object {
        Object.keys(this.request.params ?? {}).map((key) => this.filter(this.request.params, key))

        return this.request.params;
    }

    private filter(params: object, key: string): object {
        if (params.hasOwnProperty(key) && RequestWatcher.paramsToFilter.includes(key)) {
            return Object.assign(params, {[key]: '********'})
        }

        return params;
    }

    private shouldIgnore(): boolean {
        const checks = RequestWatcher.ignorePaths.map((path) => this.request.path.startsWith(path))

        return checks.includes(true)
    }

    private contentWithinLimits(content: any): any
    {
        try {
            content = JSON.parse(content);
        } catch (e) {}

        return stringify(content).length > (1000 * RequestWatcher.responseSizeLimit) ? 'Purged By Telescope' : content;
    }

    private interceptResponse(): void
    {
        const oldSend = this.response.send;

        this.response.send = (content) => {
            this.responseBody = this.contentWithinLimits(content);

            const sent = oldSend.call(this.response, content);

            this.save()

            return sent;
        };
    }
}