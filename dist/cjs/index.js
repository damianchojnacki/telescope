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
exports.WatcherEntryCollectionType = exports.WatcherEntryDataType = exports.WatcherEntry = exports.DB = exports.LogWatcherEntry = exports.LogWatcher = exports.DumpWatcherEntry = exports.DumpWatcher = exports.ErrorWatcherEntry = exports.ErrorWatcher = exports.ClientRequestWatcherEntry = exports.ClientRequestWatcher = exports.RequestWatcherEntry = exports.RequestWatcher = exports.MemoryDriver = exports.LowDriver = exports.JSONFileSyncAdapter = void 0;
const JSONFileSyncAdapter_js_1 = __importDefault(require("./api/drivers/JSONFileSyncAdapter.js"));
exports.JSONFileSyncAdapter = JSONFileSyncAdapter_js_1.default;
const LowDriver_js_1 = __importDefault(require("./api/drivers/LowDriver.js"));
exports.LowDriver = LowDriver_js_1.default;
const MemoryDriver_js_1 = __importDefault(require("./api/drivers/MemoryDriver.js"));
exports.MemoryDriver = MemoryDriver_js_1.default;
const RequestWatcher_js_1 = __importStar(require("./api/watchers/RequestWatcher.js"));
exports.RequestWatcher = RequestWatcher_js_1.default;
Object.defineProperty(exports, "RequestWatcherEntry", { enumerable: true, get: function () { return RequestWatcher_js_1.RequestWatcherEntry; } });
const ClientRequestWatcher_js_1 = __importStar(require("./api/watchers/ClientRequestWatcher.js"));
exports.ClientRequestWatcher = ClientRequestWatcher_js_1.default;
Object.defineProperty(exports, "ClientRequestWatcherEntry", { enumerable: true, get: function () { return ClientRequestWatcher_js_1.ClientRequestWatcherEntry; } });
const ErrorWatcher_js_1 = __importStar(require("./api/watchers/ErrorWatcher.js"));
exports.ErrorWatcher = ErrorWatcher_js_1.default;
Object.defineProperty(exports, "ErrorWatcherEntry", { enumerable: true, get: function () { return ErrorWatcher_js_1.ErrorWatcherEntry; } });
const DumpWatcher_js_1 = __importStar(require("./api/watchers/DumpWatcher.js"));
exports.DumpWatcher = DumpWatcher_js_1.default;
Object.defineProperty(exports, "DumpWatcherEntry", { enumerable: true, get: function () { return DumpWatcher_js_1.DumpWatcherEntry; } });
const LogWatcher_js_1 = __importStar(require("./api/watchers/LogWatcher.js"));
exports.LogWatcher = LogWatcher_js_1.default;
Object.defineProperty(exports, "LogWatcherEntry", { enumerable: true, get: function () { return LogWatcher_js_1.LogWatcherEntry; } });
const DB_js_1 = __importDefault(require("./api/DB.js"));
exports.DB = DB_js_1.default;
const Telescope_js_1 = __importDefault(require("./api/Telescope.js"));
const WatcherEntry_js_1 = __importStar(require("./api/WatcherEntry.js"));
exports.WatcherEntry = WatcherEntry_js_1.default;
Object.defineProperty(exports, "WatcherEntryCollectionType", { enumerable: true, get: function () { return WatcherEntry_js_1.WatcherEntryCollectionType; } });
Object.defineProperty(exports, "WatcherEntryDataType", { enumerable: true, get: function () { return WatcherEntry_js_1.WatcherEntryDataType; } });
exports.default = Telescope_js_1.default;
