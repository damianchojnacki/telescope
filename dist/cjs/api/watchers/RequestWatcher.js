"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestWatcherEntry = exports.HTTPMethod = void 0;
const DB_js_1 = __importDefault(require("../DB.js"));
const WatcherEntry_js_1 = __importStar(require("../WatcherEntry.js"));
const os_1 = require("os");
const JSONFileSyncAdapter_js_1 = __importDefault(require("../drivers/JSONFileSyncAdapter.js"));
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["HEAD"] = "HEAD";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["PATCH"] = "PATCH";
    HTTPMethod["DELETE"] = "DELETE";
})(HTTPMethod = exports.HTTPMethod || (exports.HTTPMethod = {}));
class RequestWatcherEntry extends WatcherEntry_js_1.default {
    constructor(data, batchId) {
        super(WatcherEntry_js_1.WatcherEntryDataType.requests, data, batchId);
    }
}
exports.RequestWatcherEntry = RequestWatcherEntry;
class RequestWatcher {
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
        return JSON.stringify(content, JSONFileSyncAdapter_js_1.default.getRefReplacer()).length > (1000 * RequestWatcher.responseSizeLimit) ? 'Purged By Telescope' : content;
    }
    save() {
        const entry = new RequestWatcherEntry({
            hostname: (0, os_1.hostname)(),
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
        DB_js_1.default.requests().save(entry);
    }
    shouldIgnore() {
        const checks = RequestWatcher.ignorePaths.map((path) => {
            return path.endsWith('*') ? this.request.path.startsWith(path.slice(0, -1)) : this.request.path === path;
        });
        return checks.includes(true);
    }
}
exports.default = RequestWatcher;
RequestWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.request;
RequestWatcher.paramsToHide = ['password', 'token', '_csrf'];
RequestWatcher.ignorePaths = [];
RequestWatcher.responseSizeLimit = 64;
