"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.RequestWatcherEntry = exports.HTTPMethod = void 0;
var DB_js_1 = require("../DB.js");
var WatcherEntry_js_1 = require("../WatcherEntry.js");
var os_1 = require("os");
var JSONFileSyncAdapter_js_1 = require("../drivers/JSONFileSyncAdapter.js");
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["HEAD"] = "HEAD";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["PATCH"] = "PATCH";
    HTTPMethod["DELETE"] = "DELETE";
})(HTTPMethod = exports.HTTPMethod || (exports.HTTPMethod = {}));
var RequestWatcherEntry = /** @class */ (function (_super) {
    __extends(RequestWatcherEntry, _super);
    function RequestWatcherEntry(data, batchId) {
        return _super.call(this, WatcherEntry_js_1.WatcherEntryDataType.requests, data, batchId) || this;
    }
    return RequestWatcherEntry;
}(WatcherEntry_js_1["default"]));
exports.RequestWatcherEntry = RequestWatcherEntry;
var RequestWatcher = /** @class */ (function () {
    function RequestWatcher(request, response, batchId) {
        this.responseBody = '';
        this.batchId = batchId;
        this.request = request;
        this.response = response;
        this.startTime = process.hrtime();
    }
    RequestWatcher.capture = function (request, response, batchId) {
        var watcher = new RequestWatcher(request, response, batchId);
        if (watcher.shouldIgnore()) {
            return;
        }
        watcher.interceptResponse(function (body) {
            watcher.responseBody = body;
            watcher.save();
        });
    };
    RequestWatcher.prototype.getMemoryUsage = function () {
        return Math.round(process.memoryUsage().rss / 1024 / 1024);
    };
    ;
    RequestWatcher.prototype.getDurationInMs = function () {
        var stopTime = process.hrtime(this.startTime);
        return Math.round(stopTime[0] * 1000 + stopTime[1] / 1000000);
    };
    RequestWatcher.prototype.getPayload = function () {
        return __assign(__assign({}, this.request.query), this.getFilteredBody());
    };
    RequestWatcher.prototype.interceptResponse = function (callback) {
        var _this = this;
        var oldSend = this.response.send;
        this.response.send = function (content) {
            var sent = oldSend.call(_this.response, content);
            callback(_this.contentWithinLimits(content));
            return sent;
        };
    };
    RequestWatcher.prototype.getFilteredBody = function () {
        var _this = this;
        var _a;
        Object.keys((_a = this.request.body) !== null && _a !== void 0 ? _a : {}).map(function (key) { return _this.filter(_this.request.body, key); });
        return this.request.body;
    };
    RequestWatcher.prototype.filter = function (params, key) {
        var _a;
        if (params.hasOwnProperty(key) && RequestWatcher.paramsToHide.includes(key)) {
            return Object.assign(params, (_a = {}, _a[key] = '********', _a));
        }
        return params;
    };
    RequestWatcher.prototype.contentWithinLimits = function (content) {
        return JSON.stringify(content, JSONFileSyncAdapter_js_1.JSONFileSyncAdapter.getRefReplacer()).length > (1000 * RequestWatcher.responseSizeLimit) ? 'Purged By Telescope' : content;
    };
    RequestWatcher.prototype.save = function () {
        var entry = new RequestWatcherEntry({
            hostname: (0, os_1.hostname)(),
            method: this.request.method,
            uri: this.request.path,
            response_status: this.response.statusCode,
            duration: this.getDurationInMs(),
            ip_address: this.request.ip,
            memory: this.getMemoryUsage(),
            payload: this.getPayload(),
            headers: this.request.headers,
            response: this.responseBody
        }, this.batchId);
        DB_js_1["default"].requests().save(entry);
    };
    RequestWatcher.prototype.shouldIgnore = function () {
        var _this = this;
        var checks = RequestWatcher.ignorePaths.map(function (path) {
            return path.endsWith('*') ? _this.request.path.startsWith(path.slice(0, -1)) : _this.request.path === path;
        });
        return checks.includes(true);
    };
    RequestWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.request;
    RequestWatcher.paramsToHide = ['password', 'token', '_csrf'];
    RequestWatcher.ignorePaths = [];
    RequestWatcher.responseSizeLimit = 64;
    return RequestWatcher;
}());
exports["default"] = RequestWatcher;
