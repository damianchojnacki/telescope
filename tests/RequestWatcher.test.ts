import express, {Express} from "express"
import Telescope from "../src/api/Telescope.js"
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "../src/api/watchers/RequestWatcher.js"
import request from "supertest"
import MemoryDriver from "../src/api/drivers/MemoryDriver.js"
import DB from "../src/api/DB.js"
import {hostname} from "os"
import bodyParser from "body-parser"

describe('RequestWatcher', () => {
    beforeEach(async () => {
        DB.driver = MemoryDriver

        await DB.truncate()
    })

    it('saves requests', async () => {
        const app = express()

        Telescope.setup(app)

        app.get('/', (request, response) => response.send('Hello World'))

        await request(app)
            .get('/?foo=bar')

        const entry = (await DB.requests().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.type).toEqual('request')
        expect(entry.content.hostname).toEqual(hostname())
        expect(entry.content.method).toEqual(HTTPMethod.GET)
        expect(entry.content.uri).toEqual('/')
        expect(entry.content.response_status).toEqual(200)
        expect(entry.content.payload).toEqual({foo: "bar"})
        expect(entry.content.response).toEqual("Hello World")
    })

    it('saves request params', async () => {
        const app = express()

        app.use(bodyParser.json())

        Telescope.setup(app)

        app.post('/', (request, response) => response.send('Hello World'))

        await request(app)
            .post('/')
            .send({foo: 'bar'})
            .set('Accept', 'application/json')

        const entry = (await DB.requests().get())[0]

        expect(entry.content.payload).toEqual({foo: "bar"})
    })

    it('can ignore request path', async () => {
        const app = express()

        Telescope.setup(app, {
            ignorePaths: ['/admin/products']
        })

        await expectCorrectRequestsLogged(app)
    })

    it('can ignore request wildcard path', async () => {
        const app = express()

        Telescope.setup(app, {
            ignorePaths: ['/admin*']
        })

        await expectCorrectRequestsLogged(app)
    })

    it('purges response', async () => {
        const app = express()

        Telescope.setup(app)

        app.get('/', (request, response) => response.send('x'.repeat(1024 * 100)))

        await request(app)
            .get('/')

        const entry = (await DB.requests().get())[0]

        expect(entry.content.response).toEqual('Purged By Telescope')
    })

    it('can change response limit', async () => {
        const app = express()

        Telescope.setup(app, {
            responseSizeLimit: 80
        })

        app.get('/purge', (request, response) => response.send('x'.repeat(1024 * 90)))
        app.get('/not-purge', (request, response) => response.send('x'.repeat(1024 * 70)))

        await request(app)
            .get('/purge')

        await request(app)
            .get('/not-purge')

        const entries = (await DB.requests().get())

        expect(entries[1].content.response).toEqual('Purged By Telescope')
        expect(entries[0].content.response).not.toEqual('Purged By Telescope')
    })

    it('hides params', async () => {
        const app = express()

        app.use(bodyParser.json())

        Telescope.setup(app)

        app.post('/', (request, response) => response.send('Hello world'))

        await request(app)
            .post('/')
            .send({name: 'john', password: 'superSecretPassword'})
            .set('Accept', 'application/json')

        const entry = (await DB.requests().get())[0]

        expect(entry.content.payload).toEqual({name: 'john', password: '********'})
    })

    it('hides custom params', async () => {
        const app = express()

        app.use(bodyParser.json())

        Telescope.setup(app, {
            paramsToHide: ['foo']
        })

        app.post('/', (request, response) => response.send('Hello world'))

        await request(app)
            .post('/')
            .send({foo: 'bar'})
            .set('Accept', 'application/json')

        const entry = (await DB.requests().get())[0]

        expect(entry.content.payload).toEqual({foo: '********'})
    })

    async function expectCorrectRequestsLogged(app: Express){
        app.get('/', (request, response) => response.send('Hello World'))
        app.get('/admin/products', (request, response) => response.send('Hello World'))

        await request(app)
            .get('/')

        await request(app)
            .get('/admin/products')

        const entries = (await DB.requests().get())

        expect(entries).toHaveLength(1)
        expect(entries[0].content.uri).toEqual('/')
    }

    it('saves authenticated user', async () => {
        const app = express()

        const user = {
            id: 1,
            name: 'John',
            email: 'user@example.com'
        }

        Telescope.setup(app, {
            getUser: () => user
        })

        app.get('/', (request, response) => response.send('Hello world'))

        await request(app)
            .get('/')

        const entry = (await DB.requests().get())[0]

        expect(entry.content.user).toEqual(user)
    })
})