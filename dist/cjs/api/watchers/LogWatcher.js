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
exports.LogWatcherEntry = exports.LogLevel = void 0;
const DB_js_1 = __importDefault(require("../DB.js"));
const WatcherEntry_js_1 = __importStar(require("../WatcherEntry.js"));
const os_1 = require("os");
const JSONFileSyncAdapter_js_1 = __importDefault(require("../drivers/JSONFileSyncAdapter.js"));
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["WARNING"] = "warning";
    LogLevel["ERROR"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class LogWatcherEntry extends WatcherEntry_js_1.default {
    constructor(data, batchId) {
        super(WatcherEntry_js_1.WatcherEntryDataType.logs, data, batchId);
    }
}
exports.LogWatcherEntry = LogWatcherEntry;
class LogWatcher {
    constructor(data, level, batchId) {
        this.batchId = batchId;
        this.data = {
            hostname: (0, os_1.hostname)(),
            level,
            message: this.getMessage(data),
            context: data,
        };
    }
    static capture(telescope) {
        const oldLog = console.log;
        console.log = (...data) => {
            oldLog(...data);
            if (typeof data[0] == 'string') {
                data[0] = data[0].split('[32m').join('');
                data[0] = data[0].split('[39m').join('');
            }
            const watcher = new LogWatcher(data, LogLevel.INFO, telescope.batchId);
            watcher.save();
        };
        const oldWarn = console.warn;
        console.warn = (...data) => {
            oldWarn(...data);
            const watcher = new LogWatcher(data, LogLevel.WARNING, telescope.batchId);
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
    }
    save() {
        const entry = new LogWatcherEntry(this.data, this.batchId);
        DB_js_1.default.logs().save(entry);
    }
    getMessage(data) {
        let message = data.shift();
        if (typeof message !== 'string') {
            message = JSON.stringify(message, JSONFileSyncAdapter_js_1.default.getRefReplacer());
        }
        return message;
    }
}
exports.default = LogWatcher;
LogWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.log;
