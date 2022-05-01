import { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, AxiosResponseHeaders, Method } from 'axios';
import WatcherEntry, { WatcherEntryCollectionType } from "../WatcherEntry.js";
import Telescope from "../Telescope.js";
export interface ClientRequestWatcherData {
    hostname: string;
    method: Method | string;
    uri: string;
    headers: AxiosRequestHeaders;
    payload: object;
    response_status: number;
    response_headers: AxiosResponseHeaders;
    response: any;
}
export declare class ClientRequestWatcherEntry extends WatcherEntry<ClientRequestWatcherData> {
    constructor(data: ClientRequestWatcherData, batchId?: string);
}
export default class ClientRequestWatcher {
    static entryType: WatcherEntryCollectionType;
    static ignoreUrls: string[];
    private batchId?;
    private request;
    private response;
    constructor(request: AxiosRequestConfig, response: AxiosResponse, batchId?: string);
    static capture(telescope: Telescope): void;
    save(): Promise<void>;
    private escapeHTML;
    private isHtmlResponse;
    private shouldIgnore;
}
