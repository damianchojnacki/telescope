"use strict";
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
var express_1 = require("express");
var DB_js_1 = require("./DB.js");
var ClientRequestWatcher_js_1 = require("./watchers/ClientRequestWatcher.js");
var LogWatcher_js_1 = require("./watchers/LogWatcher.js");
var RequestWatcher_js_1 = require("./watchers/RequestWatcher.js");
var uuid_1 = require("uuid");
var ErrorWatcher_js_1 = require("./watchers/ErrorWatcher.js");
var DumpWatcher_js_1 = require("./watchers/DumpWatcher.js");
var Telescope = /** @class */ (function () {
    function Telescope(app) {
        this.app = app;
    }
    Telescope.setup = function (app, options) {
        Telescope.config(options !== null && options !== void 0 ? options : {});
        var telescope = new Telescope(app);
        app.use('/telescope', Telescope.isAuthorized);
        telescope.setUpApi();
        telescope.setUpStaticFiles();
        app.use(function (request, response, next) {
            telescope.batchId = (0, uuid_1.v4)();
            Telescope.enabledWatchers.includes(RequestWatcher_js_1["default"])
                && RequestWatcher_js_1["default"].capture(request, response, telescope.batchId);
            next();
        });
        Telescope.enabledWatchers.includes(ClientRequestWatcher_js_1["default"])
            && ClientRequestWatcher_js_1["default"].capture(telescope);
        Telescope.enabledWatchers.includes(LogWatcher_js_1["default"])
            && LogWatcher_js_1["default"].capture(telescope);
        return telescope;
    };
    Telescope.prototype.getEnabledWatchers = function () {
        return Telescope.enabledWatchers.map(function (watcher) { return watcher.entryType; });
    };
    Telescope.config = function (options) {
        if (options.enabledWatchers) {
            Telescope.enabledWatchers = options.enabledWatchers;
        }
        if (options.isAuthorized) {
            Telescope.isAuthorized = options.isAuthorized;
        }
        if (options.databaseDriver) {
            DB_js_1["default"].driver = options.databaseDriver;
        }
        if (options.responseSizeLimit) {
            RequestWatcher_js_1["default"].responseSizeLimit = options.responseSizeLimit;
        }
        if (options.ignorePaths) {
            RequestWatcher_js_1["default"].ignorePaths = options.ignorePaths;
        }
        if (options.paramsToHide) {
            RequestWatcher_js_1["default"].paramsToHide = options.paramsToHide;
        }
        if (options.ignoreErrors) {
            ErrorWatcher_js_1["default"].ignoreErrors = options.ignoreErrors;
        }
        if (options.clientIgnoreUrls) {
            ClientRequestWatcher_js_1["default"].ignoreUrls = options.clientIgnoreUrls;
        }
    };
    Telescope.prototype.setUpApi = function () {
        var _this = this;
        this.app.post('/telescope/telescope-api/:entry', function (request, response) { return __awaiter(_this, void 0, void 0, function () {
            var entries;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DB_js_1["default"].entry(request.params.entry).get(Number((_a = request.query.take) !== null && _a !== void 0 ? _a : 50))];
                    case 1:
                        entries = _b.sent();
                        response.json({
                            entries: entries,
                            status: "enabled"
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        this.app.get('/telescope/telescope-api/:entry/:id', function (request, response) { return __awaiter(_this, void 0, void 0, function () {
            var entry, _a, _b;
            var _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, DB_js_1["default"].entry(request.params.entry).find(request.params.id)];
                    case 1:
                        entry = _e.sent();
                        _b = (_a = response).json;
                        _c = {
                            entry: entry
                        };
                        return [4 /*yield*/, DB_js_1["default"].batch((_d = entry === null || entry === void 0 ? void 0 : entry.batchId) !== null && _d !== void 0 ? _d : '')];
                    case 2:
                        _b.apply(_a, [(_c.batch = _e.sent(),
                                _c)]);
                        return [2 /*return*/];
                }
            });
        }); });
        this.app["delete"]("/telescope/telescope-api/entries", function (request, response) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DB_js_1["default"].truncate()];
                    case 1:
                        _a.sent();
                        response.send("OK");
                        return [2 /*return*/];
                }
            });
        }); });
        this.app.get("/telescope/telescope-api/entries", function (request, response) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                response.json({
                    enabled: this.getEnabledWatchers()
                });
                return [2 /*return*/];
            });
        }); });
    };
    Telescope.prototype.setUpStaticFiles = function () {
        var _this = this;
        var dir = process.cwd() + '/dist/';
        this.app.use('/telescope/app.js', express_1["default"].static(dir + "app.js"));
        this.app.use('/telescope/app.css', express_1["default"].static(dir + "app.css"));
        this.app.use('/telescope/app-dark.css', express_1["default"].static(dir + "app-dark.css"));
        this.app.use('/telescope/favicon.ico', express_1["default"].static(dir + "favicon.ico"));
        this.getEnabledWatchers().forEach(function (watcher) {
            _this.app.use("/telescope/".concat(watcher), express_1["default"].static(dir + 'index.html'));
            _this.app.use("/telescope/".concat(watcher, "/:id"), express_1["default"].static(dir + 'index.html'));
        });
        this.app.get('/telescope/', function (request, response) { return response.redirect('/telescope/requests'); });
    };
    Telescope.isAuthorized = function (request, response, next) {
        if (process.env.NODE_ENV === "production") {
            response.status(403).send('Forbidden');
            return;
        }
        next();
    };
    Telescope.enabledWatchers = [
        RequestWatcher_js_1["default"],
        ErrorWatcher_js_1["default"],
        ClientRequestWatcher_js_1["default"],
        DumpWatcher_js_1["default"],
        LogWatcher_js_1["default"]
    ];
    return Telescope;
}());
exports["default"] = Telescope;
