var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import DB from './DB.js';
import ClientRequestWatcher from "./watchers/ClientRequestWatcher.js";
import LogWatcher from "./watchers/LogWatcher.js";
import RequestWatcher from "./watchers/RequestWatcher.js";
import { v4 as uuidv4 } from "uuid";
import ErrorWatcher from "./watchers/ErrorWatcher.js";
import DumpWatcher from "./watchers/DumpWatcher.js";
export default class Telescope {
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
            telescope.batchId = uuidv4();
            Telescope.enabledWatchers.includes(RequestWatcher)
                && RequestWatcher.capture(request, response, telescope.batchId);
            next();
        });
        Telescope.enabledWatchers.includes(ClientRequestWatcher)
            && ClientRequestWatcher.capture(telescope);
        Telescope.enabledWatchers.includes(LogWatcher)
            && LogWatcher.capture(telescope);
        return telescope;
    }
    getEnabledWatchers() {
        return Telescope.enabledWatchers.map((watcher) => watcher.entryType);
    }
    static config(options) {
        if (options.enabledWatchers) {
            Telescope.enabledWatchers = options.enabledWatchers;
        }
        if (options.isAuthorized) {
            Telescope.isAuthorized = options.isAuthorized;
        }
        if (options.databaseDriver) {
            DB.driver = options.databaseDriver;
        }
        if (options.responseSizeLimit) {
            RequestWatcher.responseSizeLimit = options.responseSizeLimit;
        }
        if (options.ignorePaths) {
            RequestWatcher.ignorePaths = options.ignorePaths;
        }
        if (options.paramsToHide) {
            RequestWatcher.paramsToHide = options.paramsToHide;
        }
        if (options.ignoreErrors) {
            ErrorWatcher.ignoreErrors = options.ignoreErrors;
        }
        if (options.clientIgnoreUrls) {
            ClientRequestWatcher.ignoreUrls = options.clientIgnoreUrls;
        }
    }
    setUpApi() {
        this.app.post('/telescope/telescope-api/:entry', (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const entries = yield DB.entry(request.params.entry).get(Number((_a = request.query.take) !== null && _a !== void 0 ? _a : 50));
            response.json({
                entries,
                status: "enabled"
            });
        }));
        this.app.get('/telescope/telescope-api/:entry/:id', (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const entry = yield DB.entry(request.params.entry).find(request.params.id);
            response.json({
                entry,
                batch: yield DB.batch((_b = entry === null || entry === void 0 ? void 0 : entry.batchId) !== null && _b !== void 0 ? _b : '')
            });
        }));
        this.app.delete("/telescope/telescope-api/entries", (request, response) => __awaiter(this, void 0, void 0, function* () {
            yield DB.truncate();
            response.send("OK");
        }));
        this.app.get("/telescope/telescope-api/entries", (request, response) => __awaiter(this, void 0, void 0, function* () {
            response.json({
                enabled: this.getEnabledWatchers()
            });
        }));
    }
    setUpStaticFiles() {
        const dir = process.cwd() + '/dist/';
        this.app.use('/telescope/app.js', express.static(dir + "app.js"));
        this.app.use('/telescope/app.css', express.static(dir + "app.css"));
        this.app.use('/telescope/app-dark.css', express.static(dir + "app-dark.css"));
        this.app.use('/telescope/favicon.ico', express.static(dir + "favicon.ico"));
        this.getEnabledWatchers().forEach((watcher) => {
            this.app.use(`/telescope/${watcher}`, express.static(dir + 'index.html'));
            this.app.use(`/telescope/${watcher}/:id`, express.static(dir + 'index.html'));
        });
        this.app.get('/telescope/', (request, response) => response.redirect('/telescope/requests'));
    }
    static isAuthorized(request, response, next) {
        if (process.env.NODE_ENV === "production") {
            response.status(403).send('Forbidden');
            return;
        }
        next();
    }
}
Telescope.enabledWatchers = [
    RequestWatcher,
    ErrorWatcher,
    ClientRequestWatcher,
    DumpWatcher,
    LogWatcher
];
