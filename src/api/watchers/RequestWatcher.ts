import {Request, Response} from "express"
import {IncomingHttpHeaders} from "http"
import DB from "../DB.js"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import {hostname} from "os"
import {JSONFileSyncAdapter} from "../drivers/JSONFileSyncAdapter.js"

export type HTTPMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE"

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
    public static paramsToFilter: string[] = ['password', 'token', 'secret']
    public static ignorePaths: string[] = ['/ge*']
    public static responseSizeLimit = 64

    private batchId?: string
    private request: Request
    private response: Response
    private responseBody: any = ''
    private startTime: [number, number]
    private oldRedirect?: Function

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

        RequestWatcher.interceptResponse(response, (body: any) =>
        {
            watcher.responseBody = body

            watcher.save()
        })
    }

    public static getMemoryUsage(): number
    {
        return Math.round(process.memoryUsage().rss / 1024 / 1024)
    };

    public static getDurationInMs(startTime: [number, number]): number
    {
        const stopTime = process.hrtime(startTime)

        return Math.round(stopTime[0] * 1000 + stopTime[1] / 1000000)
    }

    public static getPayload(request: Request): object
    {
        return {
            ...request.query,
            ...RequestWatcher.getFilteredParams(request)
        }
    }

    public static interceptResponse(response: Response, callback: Function): void
    {
        const oldSend = response.send

        response.send = (content) =>
        {
            const sent = oldSend.call(response, content)

            callback(RequestWatcher.contentWithinLimits(content))

            return sent
        }
    }

    private static getFilteredParams(request: Request): object
    {
        Object.keys(request.params ?? {}).map((key) => RequestWatcher.filter(request.params, key))

        return request.params
    }

    private static filter(params: object, key: string): object
    {
        if (params.hasOwnProperty(key) && RequestWatcher.paramsToFilter.includes(key)) {
            return Object.assign(params, {[key]: '********'})
        }

        return params
    }

    private static contentWithinLimits(content: any): any
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
            duration: RequestWatcher.getDurationInMs(this.startTime),
            ip_address: this.request.ip,
            memory: RequestWatcher.getMemoryUsage(),
            payload: RequestWatcher.getPayload(this.request),
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