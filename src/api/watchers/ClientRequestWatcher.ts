import axios, {AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, AxiosResponseHeaders, Method} from 'axios'
import DB from "../DB.js"
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import {hostname} from "os"
import Telescope from "../Telescope.js"

export interface ClientRequestWatcherData
{
    hostname: string
    method: Method | string
    uri: string
    headers: AxiosRequestHeaders
    payload: object
    response_status: number
    response_headers: AxiosResponseHeaders
    response: any
}

export class ClientRequestEntry extends WatcherEntry<ClientRequestWatcherData>
{
    constructor(data: ClientRequestWatcherData, batchId?: string)
    {
        super(WatcherEntryDataType.clientRequests, data, batchId)
    }
}

export default class ClientRequestWatcher
{
    public static entryType = WatcherEntryCollectionType.clientRequest

    private batchId?: string
    private request: AxiosRequestConfig
    private response: AxiosResponse

    constructor(request: AxiosRequestConfig, response: AxiosResponse, batchId?: string)
    {
        this.batchId = batchId
        this.request = request
        this.response = response
    }

    public static capture(telescope: Telescope)
    {
        let request: AxiosRequestConfig, requestError

        axios.interceptors.request.use(function (config)
        {
            request = config

            return config
        }, function (error)
        {
            requestError = error

            return Promise.reject(error)
        })

        axios.interceptors.response.use(function (response)
        {
            const watcher = new ClientRequestWatcher(request, response, telescope.batchId)

            watcher.save()

            return response
        }, function (error)
        {
            const watcher = new ClientRequestWatcher(request, error, telescope.batchId)

            watcher.save()

            return Promise.reject(error)
        })
    }

    public save()
    {
        const entry = new ClientRequestEntry({
            hostname: hostname(),
            method: this.request.method?.toUpperCase() ?? '',
            uri: this.request.url ?? '',
            headers: this.request.headers ?? {},
            payload: this.request.data ?? {},
            response_status: this.response.status,
            response_headers: this.response.headers,
            response: this.isHtmlResponse() ? this.escapeHTML(this.response.data) : this.response.data
        }, this.batchId)

        DB.clientRequests().save(entry)
    }

    private escapeHTML(html: string)
    {
        return html.replace(
            /[&<>'"]/g,
            tag =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
        )
    }

    private isHtmlResponse(): boolean
    {
        return (this.response?.headers ?? [])['content-type']?.startsWith('text/html') ?? false
    }
}