/// <reference types="node" />
import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import WatcherEntry, { WatcherEntryCollectionType } from "../WatcherEntry.js";
export declare enum HTTPMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}
export declare type GetUserFunction = (request: Request) => User;
export interface User {
    id: string | number;
    name?: string;
    email?: string;
}
export interface RequestWatcherData {
    hostname: string;
    method?: HTTPMethod;
    controllerAction?: string;
    middleware?: string[];
    uri?: string;
    response_status: number;
    duration: number;
    ip_address?: string;
    memory: number;
    payload: object;
    headers: IncomingHttpHeaders;
    session?: object;
    user?: User;
    response: any;
}
export declare class RequestWatcherEntry extends WatcherEntry<RequestWatcherData> {
    constructor(data: RequestWatcherData, batchId?: string);
}
export default class RequestWatcher {
    static entryType: WatcherEntryCollectionType;
    static paramsToHide: string[];
    static ignorePaths: string[];
    static responseSizeLimit: number;
    private batchId?;
    private request;
    private response;
    private responseBody;
    private startTime;
    private getUser?;
    constructor(request: Request, response: Response, batchId?: string, getUser?: GetUserFunction);
    static capture(request: Request, response: Response, batchId?: string, getUser?: GetUserFunction): void;
    private getMemoryUsage;
    private getDurationInMs;
    private getPayload;
    private interceptResponse;
    private getFilteredBody;
    private filter;
    private contentWithinLimits;
    private save;
    private shouldIgnore;
}
