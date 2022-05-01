"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatcherEntryCollectionType = exports.WatcherEntryDataType = void 0;
const uuid_1 = require("uuid");
var WatcherEntryDataType;
(function (WatcherEntryDataType) {
    WatcherEntryDataType["requests"] = "request";
    WatcherEntryDataType["exceptions"] = "exception";
    WatcherEntryDataType["dumps"] = "dump";
    WatcherEntryDataType["logs"] = "log";
    WatcherEntryDataType["clientRequests"] = "client-request";
})(WatcherEntryDataType = exports.WatcherEntryDataType || (exports.WatcherEntryDataType = {}));
var WatcherEntryCollectionType;
(function (WatcherEntryCollectionType) {
    WatcherEntryCollectionType["request"] = "requests";
    WatcherEntryCollectionType["exception"] = "exceptions";
    WatcherEntryCollectionType["dump"] = "dumps";
    WatcherEntryCollectionType["log"] = "logs";
    WatcherEntryCollectionType["clientRequest"] = "client-requests";
})(WatcherEntryCollectionType = exports.WatcherEntryCollectionType || (exports.WatcherEntryCollectionType = {}));
class WatcherEntry {
    constructor(name, data, batchId) {
        this.id = (0, uuid_1.v4)();
        this.created_at = new Date().toISOString();
        this.family_hash = '';
        this.sequence = Math.round(Math.random() * 100000);
        this.tags = [];
        this.type = name;
        this.content = data;
        this.batchId = batchId;
    }
}
exports.default = WatcherEntry;
