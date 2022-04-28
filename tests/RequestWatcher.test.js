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
import bodyParser from "body-parser";
describe('RequestWatcher', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        DB.driver = MemoryDriver;
        yield DB.truncate();
    }));
    it('saves requests', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app);
        app.get('/', (request, response) => response.send('Hello World'));
        yield request(app)
            .get('/?foo=bar');
        const entry = (yield DB.requests().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.type).toEqual('request');
        expect(entry.content.hostname).toEqual(hostname());
        expect(entry.content.method).toEqual(HTTPMethod.GET);
        expect(entry.content.uri).toEqual('/');
        expect(entry.content.response_status).toEqual(200);
        expect(entry.content.payload).toEqual({ foo: "bar" });
        expect(entry.content.response).toEqual("Hello World");
    }));
    it('saves request params', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        app.use(bodyParser.json());
        Telescope.setup(app);
        app.post('/', (request, response) => response.send('Hello World'));
        yield request(app)
            .post('/')
            .send({ foo: 'bar' })
            .set('Accept', 'application/json');
        const entry = (yield DB.requests().get())[0];
        expect(entry.content.payload).toEqual({ foo: "bar" });
    }));
    it('can ignore request path', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app, {
            ignorePaths: ['/admin/products']
        });
        yield expectCorrectRequestsLogged(app);
    }));
    it('can ignore request wildcard path', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app, {
            ignorePaths: ['/admin*']
        });
        yield expectCorrectRequestsLogged(app);
    }));
    it('purges response', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app);
        app.get('/', (request, response) => response.send('x'.repeat(1024 * 100)));
        yield request(app)
            .get('/');
        const entry = (yield DB.requests().get())[0];
        expect(entry.content.response).toEqual('Purged By Telescope');
    }));
    it('can change response limit', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app, {
            responseSizeLimit: 80
        });
        app.get('/purge', (request, response) => response.send('x'.repeat(1024 * 90)));
        app.get('/not-purge', (request, response) => response.send('x'.repeat(1024 * 70)));
        yield request(app)
            .get('/purge');
        yield request(app)
            .get('/not-purge');
        const entries = (yield DB.requests().get());
        expect(entries[1].content.response).toEqual('Purged By Telescope');
        expect(entries[0].content.response).not.toEqual('Purged By Telescope');
    }));
    it('hides params', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        app.use(bodyParser.json());
        Telescope.setup(app);
        app.post('/', (request, response) => response.send('Hello world'));
        yield request(app)
            .post('/')
            .send({ name: 'john', password: 'superSecretPassword' })
            .set('Accept', 'application/json');
        const entry = (yield DB.requests().get())[0];
        expect(entry.content.payload).toEqual({ name: 'john', password: '********' });
    }));
    it('hides custom params', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        app.use(bodyParser.json());
        Telescope.setup(app, {
            paramsToHide: ['foo']
        });
        app.post('/', (request, response) => response.send('Hello world'));
        yield request(app)
            .post('/')
            .send({ foo: 'bar' })
            .set('Accept', 'application/json');
        const entry = (yield DB.requests().get())[0];
        expect(entry.content.payload).toEqual({ foo: '********' });
    }));
    function expectCorrectRequestsLogged(app) {
        return __awaiter(this, void 0, void 0, function* () {
            app.get('/', (request, response) => response.send('Hello World'));
            app.get('/admin/products', (request, response) => response.send('Hello World'));
            yield request(app)
                .get('/');
            yield request(app)
                .get('/admin/products');
            const entries = (yield DB.requests().get());
            expect(entries).toHaveLength(1);
            expect(entries[0].content.uri).toEqual('/');
        });
    }
});
