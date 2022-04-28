import {Request, Response} from "express"
import {IncomingHttpHeaders} from "http"
import DB from "../DB.js"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import {hostname} from "os"
import {JSONFileSyncAdapter} from "../drivers/JSONFileSyncAdapter.js"

export enum HTTPMethod{
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export interface RequestWatcherData
{
    hostname: string
    method?: HTTPMethod
    controllerAction?: string
    middleware?: string[]
    uri?: string
    response_status: number
    duration: number
    ip_address?: string
    memory: number
    payload: object
    headers: IncomingHttpHeaders
    session?: object
    response: any
}

export class RequestWatcherEntry extends WatcherEntry<RequestWatcherData>
{
    constructor(data: RequestWatcherData, batchId?: string)
    {
        super(WatcherEntryDataType.requests, data, batchId)
    }
}

export default class RequestWatcher
{
    public static entryType = WatcherEntryCollectionType.request

    public static paramsToHide: string[] = ['password', 'token', 'secret']
    public static ignorePaths: string[] = []
    public static responseSizeLimit = 64

    private batchId?: string
    private request: Request
    private response: Response
    private responseBody: any = ''
    private startTime: [number, number]

    constructor(request: Request, response: Response, batchId?: string)
    {
        this.batchId = batchId
        this.request = request
        this.response = response
        this.startTime = process.hrtime()
    }

    public static capture(request: Request, response: Response, batchId?: string)
    {
        const watcher = new RequestWatcher(request, response, batchId)

        if (watcher.shouldIgnore()) {
            return
        }

        watcher.interceptResponse((body: any) =>
        {
            watcher.responseBody = body

            watcher.save()
        })
    }

    private getMemoryUsage(): number
    {
        return Math.round(process.memoryUsage().rss / 1024 / 1024)
    };

    private getDurationInMs(): number
    {
        const stopTime = process.hrtime(this.startTime)

        return Math.round(stopTime[0] * 1000 + stopTime[1] / 1000000)
    }

    private getPayload(): object
    {
        return {
            ...this.request.query,
            ...this.getFilteredBody()
        }
    }

    private interceptResponse(callback: Function): void
    {
        const oldSend = this.response.send

        this.response.send = (content) =>
        {
            const sent = oldSend.call(this.response, content)

            callback(this.contentWithinLimits(content))

            return sent
        }
    }

    private getFilteredBody(): object
    {
        Object.keys(this.request.body ?? {}).map((key) => this.filter(this.request.body, key))

        return this.request.body
    }

    private filter(params: object, key: string): object
    {
        if (params.hasOwnProperty(key) && RequestWatcher.paramsToHide.includes(key)) {
            return Object.assign(params, {[key]: '********'})
        }

        return params
    }

    private contentWithinLimits(content: any): any
    {
        return JSON.stringify(content, JSONFileSyncAdapter.getRefReplacer()).length > (1000 * RequestWatcher.responseSizeLimit) ? 'Purged By Telescope' : content
    }

    private save()
    {
        const entry = new RequestWatcherEntry({
            hostname: hostname(),
            method: this.request.method as HTTPMethod,
            uri: this.request.path,
            response_status: this.response.statusCode,
            duration: this.getDurationInMs(),
            ip_address: this.request.ip,
            memory: this.getMemoryUsage(),
            payload: this.getPayload(),
            headers: this.request.headers,
            response: this.responseBody,
        }, this.batchId)

        DB.requests().save(entry)
    }

    private shouldIgnore(): boolean
    {
        const checks = RequestWatcher.ignorePaths.map((path) => {
            return path.endsWith('*') ? this.request.path.startsWith(path.slice(0, -1)) : this.request.path === path
        })

        return checks.includes(true)
    }
}