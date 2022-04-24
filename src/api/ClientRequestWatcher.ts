import { dump } from "./DumpWatcher.js";
import axios, {AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, Method, AxiosResponseHeaders} from 'axios';
import DB from "./DB.js";
import { HTTPMethod } from "./RequestWatcher.js";
import { IncomingHttpHeaders } from "http";

export interface ClientRequestWatcherData
{
    method: Method | string
    uri: string
    headers: AxiosRequestHeaders
    payload: object
    response_status: number
    response_headers: AxiosResponseHeaders
    response: any
}

export default class ClientRequestWatcher
{
    private request: AxiosRequestConfig
    private response: AxiosResponse

    public static capture()
    {
        let request: AxiosRequestConfig, requestError;

        axios.interceptors.request.use(function (config) {
            request = config;

            return config;
          }, function (error) {
            requestError = error;

            return Promise.reject(error);
          });
        
        axios.interceptors.response.use(function (response) {
            const watcher = new ClientRequestWatcher(request, response)

            watcher.save()

            return response;
          }, function (error) {
            const watcher = new ClientRequestWatcher(request, error)

            watcher.save()
            
            return Promise.reject(error);
          });
    }

    constructor(request: AxiosRequestConfig, response: AxiosResponse)
    {
        this.request = request
        this.response = response
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
        return this.response.headers['content-type']?.startsWith('text/html') ?? false
    }

    public save()
    {
        DB.clientRequests().save({
            // @ts-ignore
            method: this.request.method?.toUpperCase() ?? '',
            uri: this.request.url ?? '',
            // @ts-ignore
            headers: this.request.headers,
            payload: this.request.data ?? {},
            response_status: this.response.status,
            response_headers: this.response.headers,
            response: this.isHtmlResponse() ? this.escapeHTML(this.response.data) : this.response.data
        })
    }
}