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
import { HTTPMethod } from "../src/api/watchers/RequestWatcher.js";
import request from "supertest";
import MemoryDriver from "../src/api/drivers/MemoryDriver.js";
import DB from "../src/api/DB.js";
import { hostname } from "os";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
describe('ClientRequestWatcher', () => {
    let app;
    let mock;
    const url = 'https://swapi.dev/api/';
    const data = {
        "people": "https://swapi.dev/api/people/",
        "planets": "https://swapi.dev/api/planets/",
        "films": "https://swapi.dev/api/films/",
        "species": "https://swapi.dev/api/species/",
        "vehicles": "https://swapi.dev/api/vehicles/",
        "starships": "https://swapi.dev/api/starships/"
    };
    beforeAll(() => {
        mock = new MockAdapter(axios);
        app = express();
        Telescope.setup(app);
        app.get('/', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield axios.get(url);
            }
            catch (e) {
                next(e);
            }
            response.send('Hello World');
        }));
    });
    afterEach(() => {
        mock.reset();
    });
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        DB.driver = MemoryDriver;
        yield DB.truncate();
    }));
    it('saves client requests', () => __awaiter(void 0, void 0, void 0, function* () {
        mock.onGet(url).reply(200, data);
        yield request(app)
            .get('/');
        const entry = (yield DB.clientRequests().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.type).toEqual('client-request');
        expect(entry.content.hostname).toEqual(hostname());
        expect(entry.content.method).toEqual(HTTPMethod.GET);
        expect(entry.content.uri).toEqual(url);
        expect(entry.content.response_status).toEqual(200);
        expect(entry.content.payload).toEqual({});
        expect(entry.content.response).toEqual(data);
    }));
    it('saves client request and request in the same batch', () => __awaiter(void 0, void 0, void 0, function* () {
        mock.onGet(url).reply(200, data);
        yield request(app)
            .get('/');
        const clientRequestEntry = (yield DB.clientRequests().get())[0];
        const requestEntry = (yield DB.requests().get())[0];
        expect(clientRequestEntry === null || clientRequestEntry === void 0 ? void 0 : clientRequestEntry.batchId).toEqual(requestEntry === null || requestEntry === void 0 ? void 0 : requestEntry.batchId);
    }));
    it('saves 404 client requests', () => __awaiter(void 0, void 0, void 0, function* () {
        mock.onGet(url).reply(404, data);
        yield request(app)
            .get('/');
        const entry = (yield DB.clientRequests().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.content.response_status).toEqual(404);
    }));
    it('saves 500 client requests', () => __awaiter(void 0, void 0, void 0, function* () {
        mock.onGet(url).reply(500, data);
        yield request(app)
            .get('/');
        const entry = (yield DB.clientRequests().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.content.response_status).toEqual(500);
    }));
    it('can ignore client requests', () => __awaiter(void 0, void 0, void 0, function* () {
        Telescope.setup(app, {
            clientIgnoreUrls: ['https://swapi.dev/api/']
        });
        mock.onGet(url).reply(200, data);
        yield request(app)
            .get('/');
        const entry = (yield DB.clientRequests().get())[0];
        expect(entry).toBeUndefined();
    }));
    it('can ignore wildcard url client requests', () => __awaiter(void 0, void 0, void 0, function* () {
        Telescope.setup(app, {
            clientIgnoreUrls: ['https://swapi.dev/*']
        });
        mock.onGet(url).reply(200, data);
        yield request(app)
            .get('/');
        const entry = (yield DB.clientRequests().get())[0];
        expect(entry).toBeUndefined();
    }));
});
