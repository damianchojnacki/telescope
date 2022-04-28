import DB from "../DB.js";
import WatcherEntry, { WatcherEntryCollectionType, WatcherEntryDataType } from "../WatcherEntry.js";
import { hostname } from "os";
import { JSONFileSyncAdapter } from "../drivers/JSONFileSyncAdapter.js";
export var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["HEAD"] = "HEAD";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["PATCH"] = "PATCH";
    HTTPMethod["DELETE"] = "DELETE";
})(HTTPMethod || (HTTPMethod = {}));
export class RequestWatcherEntry extends WatcherEntry {
    constructor(data, batchId) {
        super(WatcherEntryDataType.requests, data, batchId);
    }
}
export default class RequestWatcher {
    constructor(request, response, batchId) {
        this.responseBody = '';
        this.batchId = batchId;
        this.request = request;
        this.response = response;
        this.startTime = process.hrtime();
    }
    static capture(request, response, batchId) {
        const watcher = new RequestWatcher(request, response, batchId);
        if (watcher.shouldIgnore()) {
            return;
        }
        watcher.interceptResponse((body) => {
            watcher.responseBody = body;
            watcher.save();
        });
    }
    getMemoryUsage() {
        return Math.round(process.memoryUsage().rss / 1024 / 1024);
    }
    ;
    getDurationInMs() {
        const stopTime = process.hrtime(this.startTime);
        return Math.round(stopTime[0] * 1000 + stopTime[1] / 1000000);
    }
    getPayload() {
        return Object.assign(Object.assign({}, this.request.query), this.getFilteredBody());
    }
    interceptResponse(callback) {
        const oldSend = this.response.send;
        this.response.send = (content) => {
            const sent = oldSend.call(this.response, content);
            callback(this.contentWithinLimits(content));
            return sent;
        };
    }
    getFilteredBody() {
        var _a;
        Object.keys((_a = this.request.body) !== null && _a !== void 0 ? _a : {}).map((key) => this.filter(this.request.body, key));
        return this.request.body;
    }
    filter(params, key) {
        if (params.hasOwnProperty(key) && RequestWatcher.paramsToHide.includes(key)) {
            return Object.assign(params, { [key]: '********' });
        }
        return params;
    }
    contentWithinLimits(content) {
        return JSON.stringify(content, JSONFileSyncAdapter.getRefReplacer()).length > (1000 * RequestWatcher.responseSizeLimit) ? 'Purged By Telescope' : content;
    }
    save() {
        const entry = new RequestWatcherEntry({
            hostname: hostname(),
            method: this.request.method,
            uri: this.request.path,
            response_status: this.response.statusCode,
            duration: this.getDurationInMs(),
            ip_address: this.request.ip,
            memory: this.getMemoryUsage(),
            payload: this.getPayload(),
            headers: this.request.headers,
            response: this.responseBody,
        }, this.batchId);
        DB.requests().save(entry);
    }
    shouldIgnore() {
        const checks = RequestWatcher.ignorePaths.map((path) => {
            return path.endsWith('*') ? this.request.path.startsWith(path.slice(0, -1)) : this.request.path === path;
        });
        return checks.includes(true);
    }
}
RequestWatcher.entryType = WatcherEntryCollectionType.request;
RequestWatcher.paramsToHide = ['password', 'token', '_csrf'];
RequestWatcher.ignorePaths = [];
RequestWatcher.responseSizeLimit = 64;
