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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorWatcherEntry = void 0;
const DB_js_1 = __importDefault(require("../DB.js"));
const fs_1 = require("fs");
const WatcherEntry_js_1 = __importStar(require("../WatcherEntry.js"));
const os_1 = require("os");
class ErrorWatcherEntry extends WatcherEntry_js_1.default {
    constructor(data, batchId) {
        super(WatcherEntry_js_1.WatcherEntryDataType.exceptions, data, batchId);
    }
}
exports.ErrorWatcherEntry = ErrorWatcherEntry;
class ErrorWatcher {
    constructor(error, batchId) {
        this.error = error;
        this.batchId = batchId;
    }
    static setup(telescope) {
        telescope.app.use((error, request, response, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const watcher = new ErrorWatcher(error, telescope.batchId);
                if (watcher.shouldIgnore()) {
                    next(error);
                    return;
                }
                yield watcher.saveOrUpdate();
                next(error);
            }
            catch (e) {
                next(e);
            }
        }));
        // catch async errors
        process
            .on('uncaughtException', (error) => __awaiter(this, void 0, void 0, function* () {
            const watcher = new ErrorWatcher(error, telescope.batchId);
            if (watcher.shouldIgnore()) {
                return;
            }
            yield watcher.saveOrUpdate();
            console.error(error);
            process.exit(1);
        }));
    }
    getSameError() {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (yield DB_js_1.default.errors().get());
            const index = errors.findIndex(error => this.isSameError(error));
            const error = errors.find(error => this.isSameError(error));
            return { error, index };
        });
    }
    saveOrUpdate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { error, index } = yield this.getSameError();
            const entry = new ErrorWatcherEntry({
                hostname: (0, os_1.hostname)(),
                class: this.error.name,
                file: this.getFile(),
                message: this.error.message,
                trace: this.getStackTrace(),
                line: this.getLine(),
                line_preview: this.getLinePreview(),
                occurrences: ((_a = error === null || error === void 0 ? void 0 : error.content.occurrences) !== null && _a !== void 0 ? _a : 0) + 1,
            }, this.batchId);
            error ? yield DB_js_1.default.errors().update(index, entry) : yield DB_js_1.default.errors().save(entry);
        });
    }
    isSameError(error) {
        return error.content.class === this.error.name &&
            error.content.message === this.error.message &&
            error.content.file === this.getFile();
    }
    shouldIgnore() {
        return ErrorWatcher.ignoreErrors.includes(this.error.constructor);
    }
    getFile() {
        var _a, _b, _c;
        return (_c = ((_b = (_a = this.error.stack) === null || _a === void 0 ? void 0 : _a.split('\n')[1]) !== null && _b !== void 0 ? _b : '').split('at ')[1]) !== null && _c !== void 0 ? _c : '';
    }
    getLine() {
        var _a, _b;
        const line = ((_b = (_a = this.error.stack) === null || _a === void 0 ? void 0 : _a.split('\n')[1]) !== null && _b !== void 0 ? _b : '').split(':');
        return Number(line[line.length - 2]);
    }
    getLinePreview() {
        var _a;
        const path = (_a = this.getFile().replace('file://', '').split(':')[0]) !== null && _a !== void 0 ? _a : '';
        const preview = {};
        const errorLine = this.getLine();
        path && (0, fs_1.existsSync)(path) && (0, fs_1.readFileSync)(path).toString().split('\n').forEach((line, index) => {
            if (index > errorLine - 10 && index < errorLine + 10) {
                preview[index + 1] = line;
            }
        });
        return preview;
    }
    getStackTrace() {
        var _a, _b;
        const lines = (_b = (_a = this.error.stack) === null || _a === void 0 ? void 0 : _a.split("\n")) !== null && _b !== void 0 ? _b : [];
        lines.shift();
        return lines.map((line) => {
            var _a;
            const counters = line.split(':');
            return {
                file: line.trim(),
                line: Number((_a = counters[counters.length - 2]) !== null && _a !== void 0 ? _a : null)
            };
        });
    }
}
exports.default = ErrorWatcher;
ErrorWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.exception;
ErrorWatcher.ignoreErrors = [];
