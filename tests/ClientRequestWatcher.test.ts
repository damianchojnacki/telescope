import express, {Express, NextFunction, Request, Response} from "express"
import Telescope from "../src/api/Telescope.js"
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "../src/api/watchers/RequestWatcher.js"
import request from "supertest"
import MemoryDriver from "../src/api/drivers/MemoryDriver.js"
import DB from "../src/api/DB.js"
import {hostname} from "os"
import bodyParser from "body-parser"
import axios, {AxiosResponse} from "axios"
import ErrorWatcher from "../src/api/watchers/ErrorWatcher.js"
import MockAdapter from "axios-mock-adapter"

describe('ClientRequestWatcher', () => {
    let app: Express
    let mock: MockAdapter

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

        app = express()

        Telescope.setup(app)

        app.get('/', async (request, response, next) => {
            try{
                await axios.get(url)
            } catch(e) {
                next(e)
            }

            response.send('Hello World')
        })
    });

    afterEach(() => {
        mock.reset();
    });

    beforeEach(async () => {
        DB.driver = MemoryDriver

        await DB.truncate()
    })

    it('saves client requests', async () => {
        mock.onGet(url).reply(200, data)

        await request(app)
            .get('/')

        const entry = (await DB.clientRequests().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.type).toEqual('client-request')
        expect(entry.content.hostname).toEqual(hostname())
        expect(entry.content.method).toEqual(HTTPMethod.GET)
        expect(entry.content.uri).toEqual(url)
        expect(entry.content.response_status).toEqual(200)
        expect(entry.content.payload).toEqual({})
        expect(entry.content.response).toEqual(data)
    })

    it('saves client request and request in the same batch', async () => {
        mock.onGet(url).reply(200, data)

        await request(app)
            .get('/')

        const clientRequestEntry = (await DB.clientRequests().get())[0]
        const requestEntry = (await DB.requests().get())[0]

        expect(clientRequestEntry?.batchId).toEqual(requestEntry?.batchId)
    })

    it('saves 404 client requests', async () => {
        mock.onGet(url).reply(404, data)

        await request(app)
            .get('/')

        const entry = (await DB.clientRequests().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.content.response_status).toEqual(404)
    })

    it('saves 500 client requests', async () => {
        mock.onGet(url).reply(500, data)

        await request(app)
            .get('/')

        const entry = (await DB.clientRequests().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.content.response_status).toEqual(500)
    })

    it('can ignore client requests', async () => {
        Telescope.setup(app, {
            clientIgnoreUrls: ['https://swapi.dev/api/']
        })

        mock.onGet(url).reply(200, data)

        await request(app)
            .get('/')

        const entry = (await DB.clientRequests().get())[0]

        expect(entry).toBeUndefined()
    })

    it('can ignore wildcard url client requests', async () => {
        Telescope.setup(app, {
            clientIgnoreUrls: ['https://swapi.dev/*']
        })

        mock.onGet(url).reply(200, data)

        await request(app)
            .get('/')

        const entry = (await DB.clientRequests().get())[0]

        expect(entry).toBeUndefined()
    })
})