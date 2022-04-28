import express, {Express} from "express"
import Telescope from "../src/api/Telescope.js"
import RequestWatcher, {HTTPMethod, RequestWatcherEntry} from "../src/api/watchers/RequestWatcher.js"
import request from "supertest"
import MemoryDriver from "../src/api/drivers/MemoryDriver.js"
import DB from "../src/api/DB.js"
import {hostname} from "os"
import bodyParser from "body-parser"
import ErrorWatcher from "../src/api/watchers/ErrorWatcher.js"
import {dump} from "../src/api/watchers/DumpWatcher.js"

describe('DumpWatcher', () => {
    beforeEach(async () => {
        DB.driver = MemoryDriver

        await DB.truncate()
    })

    it('saves dumps', async () => {
        const app = express()

        Telescope.setup(app)

        dump('Hello world')

        const entry = (await DB.dumps().get())[0]

        expect(entry).not.toBeUndefined()
        expect(entry.type).toEqual('dump')
    })

    it('saves string dumps', async () => {
        await assertDump('Hello world')
    })

    it('saves object dumps', async () => {
        await assertDump({
            foo: "bar"
        })
    })

    it('saves array dumps', async () => {
        await assertDump([
            'foo',
            'bar'
        ])
    })

    it('saves complex dumps', async () => {
        await assertDump([
            {
                "name": "Luke Skywalker",
                "height": "172",
                "films": [
                    "https://swapi.dev/api/films/1/",
                    "https://swapi.dev/api/films/2/",
                    "https://swapi.dev/api/films/3/",
                    "https://swapi.dev/api/films/6/"
                ],
                "species": [
                    {
                        "sci-fi": true
                    }
                ],
            }
        ])
    })

    async function assertDump(content: any)
    {
        const app = express()

        Telescope.setup(app)

        dump(content)

        const entry = (await DB.dumps().get())[0]

        expect(entry.content.dump).toEqual(content)
    }
})