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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DB_js_1 = __importDefault(require("./DB.js"));
const ClientRequestWatcher_js_1 = __importDefault(require("./watchers/ClientRequestWatcher.js"));
const LogWatcher_js_1 = __importDefault(require("./watchers/LogWatcher.js"));
const RequestWatcher_js_1 = __importDefault(require("./watchers/RequestWatcher.js"));
const uuid_1 = require("uuid");
const ErrorWatcher_js_1 = __importDefault(require("./watchers/ErrorWatcher.js"));
const DumpWatcher_js_1 = __importDefault(require("./watchers/DumpWatcher.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class Telescope {
    constructor(app) {
        this.app = app;
    }
    static setup(app, options) {
        Telescope.config(options !== null && options !== void 0 ? options : {});
        const telescope = new Telescope(app);
        app.use('/telescope', Telescope.isAuthorized);
        telescope.setUpApi();
        telescope.setUpStaticFiles();
        app.use((request, response, next) => {
            telescope.batchId = (0, uuid_1.v4)();
            Telescope.enabledWatchers.includes(RequestWatcher_js_1.default)
                && RequestWatcher_js_1.default.capture(request, response, telescope.batchId);
            next();
        });
        Telescope.enabledWatchers.includes(ClientRequestWatcher_js_1.default)
            && ClientRequestWatcher_js_1.default.capture(telescope);
        Telescope.enabledWatchers.includes(LogWatcher_js_1.default)
            && LogWatcher_js_1.default.capture(telescope);
        return telescope;
    }
    static config(options) {
        if (options.enabledWatchers) {
            Telescope.enabledWatchers = options.enabledWatchers;
        }
        if (options.isAuthorized) {
            Telescope.isAuthorized = options.isAuthorized;
        }
        if (options.databaseDriver) {
            DB_js_1.default.driver = options.databaseDriver;
        }
        if (options.responseSizeLimit) {
            RequestWatcher_js_1.default.responseSizeLimit = options.responseSizeLimit;
        }
        if (options.ignorePaths) {
            RequestWatcher_js_1.default.ignorePaths = options.ignorePaths;
        }
        if (options.paramsToHide) {
            RequestWatcher_js_1.default.paramsToHide = options.paramsToHide;
        }
        if (options.ignoreErrors) {
            ErrorWatcher_js_1.default.ignoreErrors = options.ignoreErrors;
        }
        if (options.clientIgnoreUrls) {
            ClientRequestWatcher_js_1.default.ignoreUrls = options.clientIgnoreUrls;
        }
    }
    static isAuthorized(request, response, next) {
        if (process.env.NODE_ENV === "production") {
            response.status(403).send('Forbidden');
            return;
        }
        next();
    }
    getEnabledWatchers() {
        return Telescope.enabledWatchers.map((watcher) => watcher.entryType);
    }
    setUpApi() {
        this.app.post('/telescope/telescope-api/:entry', (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const entries = yield DB_js_1.default.entry(request.params.entry).get(Number((_a = request.query.take) !== null && _a !== void 0 ? _a : 50));
            response.json({
                entries,
                status: "enabled"
            });
        }));
        this.app.get('/telescope/telescope-api/:entry/:id', (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const entry = yield DB_js_1.default.entry(request.params.entry).find(request.params.id);
            response.json({
                entry,
                batch: yield DB_js_1.default.batch((_b = entry === null || entry === void 0 ? void 0 : entry.batchId) !== null && _b !== void 0 ? _b : '')
            });
        }));
        this.app.delete("/telescope/telescope-api/entries", (request, response) => __awaiter(this, void 0, void 0, function* () {
            yield DB_js_1.default.truncate();
            response.send("OK");
        }));
        this.app.get("/telescope/telescope-api/entries", (request, response) => __awaiter(this, void 0, void 0, function* () {
            response.json({
                enabled: this.getEnabledWatchers()
            });
        }));
    }
    resolveDir() {
        let dir = process.cwd() + '/node_modules/@damianchojnacki/telescope/dist/';
        if (!(0, fs_1.existsSync)(dir + 'index.html')) {
            dir = path_1.default.join(process.cwd(), '/dist/');
        }
        return dir;
    }
    setUpStaticFiles() {
        const dir = this.resolveDir();
        this.app.use('/telescope/app.js', express_1.default.static(dir + "app.js"));
        this.app.use('/telescope/app.css', express_1.default.static(dir + "app.css"));
        this.app.use('/telescope/app-dark.css', express_1.default.static(dir + "app-dark.css"));
        this.app.use('/telescope/favicon.ico', express_1.default.static(dir + "favicon.ico"));
        this.getEnabledWatchers().forEach((watcher) => {
            this.app.use(`/telescope/${watcher}`, express_1.default.static(dir + 'index.html'));
            this.app.use(`/telescope/${watcher}/:id`, express_1.default.static(dir + 'index.html'));
        });
        this.app.get('/telescope/', (request, response) => response.redirect('/telescope/requests'));
    }
}
exports.default = Telescope;
Telescope.enabledWatchers = [
    RequestWatcher_js_1.default,
    ErrorWatcher_js_1.default,
    ClientRequestWatcher_js_1.default,
    DumpWatcher_js_1.default,
    //LogWatcher
];
