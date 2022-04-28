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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ClientRequestEntry = void 0;
var axios_1 = require("axios");
var DB_js_1 = require("../DB.js");
var WatcherEntry_js_1 = require("../WatcherEntry.js");
var os_1 = require("os");
var ClientRequestEntry = /** @class */ (function (_super) {
    __extends(ClientRequestEntry, _super);
    function ClientRequestEntry(data, batchId) {
        return _super.call(this, WatcherEntry_js_1.WatcherEntryDataType.clientRequests, data, batchId) || this;
    }
    return ClientRequestEntry;
}(WatcherEntry_js_1["default"]));
exports.ClientRequestEntry = ClientRequestEntry;
var ClientRequestWatcher = /** @class */ (function () {
    function ClientRequestWatcher(request, response, batchId) {
        this.batchId = batchId;
        this.request = request;
        this.response = response;
    }
    ClientRequestWatcher.capture = function (telescope) {
        var _this = this;
        var request = null;
        axios_1["default"].interceptors.request.use(function (config) {
            request = config;
            return config;
        });
        axios_1["default"].interceptors.response.use(function (response) { return __awaiter(_this, void 0, void 0, function () {
            var watcher, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!request) return [3 /*break*/, 3];
                        watcher = new ClientRequestWatcher(request, response, telescope.batchId);
                        _a = !watcher.shouldIgnore();
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, watcher.save()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _a;
                        request = null;
                        _b.label = 3;
                    case 3: return [2 /*return*/, response];
                }
            });
        }); }, function (error) { return __awaiter(_this, void 0, void 0, function () {
            var watcher, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!request) return [3 /*break*/, 3];
                        watcher = new ClientRequestWatcher(request, error.response, telescope.batchId);
                        _a = !watcher.shouldIgnore();
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, watcher.save()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _a;
                        request = null;
                        _b.label = 3;
                    case 3: return [2 /*return*/, Promise.reject(error)];
                }
            });
        }); });
    };
    ClientRequestWatcher.prototype.save = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        entry = new ClientRequestEntry({
                            hostname: (0, os_1.hostname)(),
                            method: (_b = (_a = this.request.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '',
                            uri: (_c = this.request.url) !== null && _c !== void 0 ? _c : '',
                            headers: (_d = this.request.headers) !== null && _d !== void 0 ? _d : {},
                            payload: (_e = this.request.data) !== null && _e !== void 0 ? _e : {},
                            response_status: this.response.status,
                            response_headers: this.response.headers,
                            response: this.isHtmlResponse() ? this.escapeHTML(this.response.data) : this.response.data
                        }, this.batchId);
                        return [4 /*yield*/, DB_js_1["default"].clientRequests().save(entry)];
                    case 1:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientRequestWatcher.prototype.escapeHTML = function (html) {
        return html.replace(/[&<>'"]/g, function (tag) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag);
        });
    };
    ClientRequestWatcher.prototype.isHtmlResponse = function () {
        var _a, _b, _c, _d;
        return (_d = (_c = ((_b = (_a = this.response) === null || _a === void 0 ? void 0 : _a.headers) !== null && _b !== void 0 ? _b : [])['content-type']) === null || _c === void 0 ? void 0 : _c.startsWith('text/html')) !== null && _d !== void 0 ? _d : false;
    };
    ClientRequestWatcher.prototype.shouldIgnore = function () {
        var _this = this;
        var checks = ClientRequestWatcher.ignoreUrls.map(function (url) {
            var _a;
            return url.endsWith('*') ? (_a = _this.request.url) === null || _a === void 0 ? void 0 : _a.startsWith(url.slice(0, -1)) : _this.request.url === url;
        });
        return checks.includes(true);
    };
    ClientRequestWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.clientRequest;
    ClientRequestWatcher.ignoreUrls = [];
    return ClientRequestWatcher;
}());
exports["default"] = ClientRequestWatcher;
