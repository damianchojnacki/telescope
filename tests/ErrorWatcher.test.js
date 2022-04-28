var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import Telescope from "../src/api/Telescope.js";
import request from "supertest";
import MemoryDriver from "../src/api/drivers/MemoryDriver.js";
import DB from "../src/api/DB.js";
import { hostname } from "os";
import ErrorWatcher from "../src/api/watchers/ErrorWatcher.js";
describe('ErrorWatcher', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        DB.driver = MemoryDriver;
        yield DB.truncate();
    }));
    it('saves errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        const telescope = Telescope.setup(app);
        const error = new Error('Hello world');
        app.get('/', (request, response) => {
            throw error;
        });
        ErrorWatcher.setup(telescope);
        yield request(app)
            .get('/');
        const entry = (yield DB.errors().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.type).toEqual('exception');
        expect(entry.content.hostname).toEqual(hostname());
        expect(entry.content.class).toEqual(error.constructor.name);
        expect(entry.content.file).toEqual('/home/damian/Projekty/telescope/tests/ErrorWatcher.test.ts:23:23');
        expect(entry.content.message).toEqual(error.message);
        expect(entry.content.occurrences).toEqual(1);
    }));
    it('saves error and request in the same batch', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        const telescope = Telescope.setup(app);
        app.get('/', (request, response) => {
            throw new Error('Hello world');
        });
        app.use((error, request, response, next) => {
            response.status(500).send('Server error');
            next(error);
        });
        ErrorWatcher.setup(telescope);
        yield request(app)
            .get('/');
        const errorEntry = (yield DB.errors().get())[0];
        const requestEntry = (yield DB.requests().get())[0];
        expect(errorEntry === null || errorEntry === void 0 ? void 0 : errorEntry.batchId).toEqual(requestEntry === null || requestEntry === void 0 ? void 0 : requestEntry.batchId);
    }));
    it('updates errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        const telescope = Telescope.setup(app);
        app.get('/', (request, response) => {
            throw new Error();
        });
        ErrorWatcher.setup(telescope);
        yield request(app)
            .get('/');
        yield request(app)
            .get('/');
        const entries = yield DB.errors().get();
        expect(entries).toHaveLength(1);
        expect(entries[0].content.occurrences).toEqual(2);
    }));
    it('can ignore errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        const telescope = Telescope.setup(app, {
            ignoreErrors: [TypeError]
        });
        app.get('/type', (request, response) => {
            throw new TypeError('TypeError');
        });
        app.get('/', (request, response) => {
            throw new Error('Error');
        });
        ErrorWatcher.setup(telescope);
        yield request(app)
            .get('/');
        yield request(app)
            .get('/type');
        const entries = yield DB.errors().get();
        expect(entries).toHaveLength(1);
        expect(entries[0].content.class).toEqual('Error');
    }));
});
