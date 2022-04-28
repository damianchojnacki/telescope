import DB from "../DB.js";
import WatcherEntry, { WatcherEntryCollectionType, WatcherEntryDataType } from "../WatcherEntry.js";
import { hostname } from "os";
import { JSONFileSyncAdapter } from "../drivers/JSONFileSyncAdapter.js";
export var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["WARNING"] = "warning";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
export class LogWatcherEntry extends WatcherEntry {
    constructor(data, batchId) {
        super(WatcherEntryDataType.logs, data, batchId);
    }
}
export default class LogWatcher {
    constructor(data, level, batchId) {
        this.batchId = batchId;
        this.data = {
            hostname: hostname(),
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
        DB.logs().save(entry);
    }
    getMessage(data) {
        let message = data.shift();
        if (typeof message !== 'string') {
            message = JSON.stringify(message, JSONFileSyncAdapter.getRefReplacer());
        }
        return message;
    }
}
LogWatcher.entryType = WatcherEntryCollectionType.log;
