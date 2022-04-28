import express, {Express, Request, Response, NextFunction} from "express"
import Telescope from "../src/api/Telescope.js"
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "../src/api/watchers/RequestWatcher.js"
import request from "supertest"
import MemoryDriver from "../src/api/drivers/MemoryDriver.js"
import DB from "../src/api/DB.js"
import {hostname} from "os"
import bodyParser from "body-parser"
import ErrorWatcher from "../src/api/watchers/ErrorWatcher.js"

describe('ErrorWatcher', () => {
    beforeEach(async () => {
        DB.driver = MemoryDriver

        await DB.truncate()
    })

    it('saves errors', async () => {
        const app = express()

        const telescope = Telescope.setup(app)

        const error = new Error('Hello world');

        app.get('/', (request, response) => {
            throw error
        })

        ErrorWatcher.setup(telescope)

        await request(app)
            .get('/')

        const entry = (await DB.errors().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.type).toEqual('exception')
        expect(entry.content.hostname).toEqual(hostname())
        expect(entry.content.class).toEqual(error.constructor.name)
        expect(entry.content.file).toEqual('/home/damian/Projekty/telescope/tests/ErrorWatcher.test.ts:23:23')
        expect(entry.content.message).toEqual(error.message)
        expect(entry.content.occurrences).toEqual(1)
    })

    it('saves error and request in the same batch', async () => {
        const app = express()

        const telescope = Telescope.setup(app)

        app.get('/', (request, response) => {
            throw new Error('Hello world')
        })

        app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
            response.status(500).send('Server error')

            next(error)
        })

        ErrorWatcher.setup(telescope)

        await request(app)
            .get('/')

        const errorEntry = (await DB.errors().get())[0]
        const requestEntry = (await DB.requests().get())[0]

        expect(errorEntry?.batchId).toEqual(requestEntry?.batchId)
    })

    it('updates errors', async () => {
        const app = express()

        const telescope = Telescope.setup(app)

        app.get('/', (request, response) => {
            throw new Error()
        })

        ErrorWatcher.setup(telescope)

        await request(app)
            .get('/')

        await request(app)
            .get('/')

        const entries = await DB.errors().get()

        expect(entries).toHaveLength(1)
        expect(entries[0].content.occurrences).toEqual(2)
    })

    it('can ignore errors', async () => {
        const app = express()

        const telescope = Telescope.setup(app, {
            ignoreErrors: [TypeError]
        })

        app.get('/type', (request, response) => {
            throw new TypeError('TypeError')
        })

        app.get('/', (request, response) => {
            throw new Error('Error')
        })

        ErrorWatcher.setup(telescope)

        await request(app)
            .get('/')

        await request(app)
            .get('/type')

        const entries = await DB.errors().get()

        expect(entries).toHaveLength(1)
        expect(entries[0].content.class).toEqual('Error')
    })
})