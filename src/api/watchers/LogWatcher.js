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
exports.__esModule = true;
exports.LogWatcherEntry = exports.LogLevel = void 0;
var DB_js_1 = require("../DB.js");
var WatcherEntry_js_1 = require("../WatcherEntry.js");
var os_1 = require("os");
var JSONFileSyncAdapter_js_1 = require("../drivers/JSONFileSyncAdapter.js");
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["WARNING"] = "warning";
    LogLevel["ERROR"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var LogWatcherEntry = /** @class */ (function (_super) {
    __extends(LogWatcherEntry, _super);
    function LogWatcherEntry(data, batchId) {
        return _super.call(this, WatcherEntry_js_1.WatcherEntryDataType.logs, data, batchId) || this;
    }
    return LogWatcherEntry;
}(WatcherEntry_js_1["default"]));
exports.LogWatcherEntry = LogWatcherEntry;
var LogWatcher = /** @class */ (function () {
    function LogWatcher(data, level, batchId) {
        this.batchId = batchId;
        this.data = {
            hostname: (0, os_1.hostname)(),
            level: level,
            message: this.getMessage(data),
            context: data
        };
    }
    LogWatcher.capture = function (telescope) {
        var oldLog = console.log;
        console.log = function () {
            var data = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                data[_i] = arguments[_i];
            }
            oldLog.apply(void 0, data);
            if (typeof data[0] == 'string') {
                data[0] = data[0].split('[32m').join('');
                data[0] = data[0].split('[39m').join('');
            }
            var watcher = new LogWatcher(data, LogLevel.INFO, telescope.batchId);
            watcher.save();
        };
        var oldWarn = console.warn;
        console.warn = function () {
            var data = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                data[_i] = arguments[_i];
            }
            oldWarn.apply(void 0, data);
            var watcher = new LogWatcher(data, LogLevel.WARNING, telescope.batchId);
            watcher.save();
        };
        /* console.error handles ErrorWatcher
        const oldError = console.error

        console.error = (...data: any[]) => {
            oldError(...data)

            const watcher = new LogWatcher(data, LogLevel.ERROR, telescope.batchId)

            watcher.save()
        }
        */
    };
    LogWatcher.prototype.save = function () {
        var entry = new LogWatcherEntry(this.data, this.batchId);
        DB_js_1["default"].logs().save(entry);
    };
    LogWatcher.prototype.getMessage = function (data) {
        var message = data.shift();
        if (typeof message !== 'string') {
            message = JSON.stringify(message, JSONFileSyncAdapter_js_1.JSONFileSyncAdapter.getRefReplacer());
        }
        return message;
    };
    LogWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.log;
    return LogWatcher;
}());
exports["default"] = LogWatcher;
