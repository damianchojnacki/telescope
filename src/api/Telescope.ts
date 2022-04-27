import express, {Express} from 'express'
import DB, {Driver} from './DB.js'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import ClientRequestWatcher from "./watchers/ClientRequestWatcher.js"
import LogWatcher from "./watchers/LogWatcher.js"
import RequestWatcher from "./watchers/RequestWatcher.js"
import {v4 as uuidv4} from "uuid"
import {WatcherEntryCollectionType} from "./WatcherEntry.js"
import ErrorWatcher from "./watchers/ErrorWatcher.js"
import DumpWatcher from "./watchers/DumpWatcher.js"

type Watcher =
    typeof RequestWatcher |
    typeof ErrorWatcher |
    typeof ClientRequestWatcher |
    typeof DumpWatcher |
    typeof LogWatcher

export interface TelescopeOptions
{
    enabledWatchers?: Watcher[]
    databaseDriver?: Driver
    responseSizeLimit?: number
    paramsToFilter?: string[]
    ignorePaths?: string[]
}

export default class Telescope
{
    private static enabledWatchers: Watcher[] = [
        RequestWatcher,
        ErrorWatcher,
        ClientRequestWatcher,
        DumpWatcher,
        LogWatcher
    ]

    public app: Express
    public batchId?: string
    public startTime?: [number, number]

    constructor(app: Express)
    {
        this.app = app
    }

    public static setup(app: Express, options?: TelescopeOptions)
    {
        Telescope.config(options ?? {})

        const telescope = new Telescope(app)

        telescope.setUpApi()
        telescope.setUpStaticFiles()

        app.use((request, response, next) =>
        {
            telescope.batchId = uuidv4()
            telescope.startTime = process.hrtime()

            Telescope.enabledWatchers.includes(RequestWatcher)
                && RequestWatcher.capture(request, response, telescope.batchId)

            next()
        })

        Telescope.enabledWatchers.includes(ClientRequestWatcher)
            && ClientRequestWatcher.capture(telescope)

        Telescope.enabledWatchers.includes(LogWatcher)
            && LogWatcher.capture(telescope)

        return telescope
    }

    private static config(options: TelescopeOptions)
    {
        if (options.enabledWatchers) {
            Telescope.enabledWatchers = options.enabledWatchers
        }

        if (options.databaseDriver) {
            DB.driver = options.databaseDriver
        }

        if(options.responseSizeLimit){
            RequestWatcher.responseSizeLimit = options.responseSizeLimit
        }
    }

    public setUpApi()
    {
        this.app.post('/telescope/telescope-api/:entry', async (request, response) =>
        {
            const entries = await DB.entry(request.params.entry as WatcherEntryCollectionType).get(Number(request.query.take ?? 50))

            response.json({
                entries,
                status: "enabled"
            })
        })

        this.app.get('/telescope/telescope-api/:entry/:id', async (request, response) =>
        {
            const entry = await DB.entry(request.params.entry as WatcherEntryCollectionType).find(request.params.id)

            response.json({
                entry,
                batch: await DB.batch(entry?.batchId ?? '')
            })
        })

        this.app.delete("/telescope/telescope-api/entries", async (request, response) =>
        {
            await DB.truncate()

            response.send("OK")
        })

        this.app.get("/telescope/telescope-api/entries", async (request, response) =>
        {
            response.json({
                enabled: Telescope.enabledWatchers.map((watcher) => watcher.entryType)
            })
        })
    }

    private setUpStaticFiles()
    {
        const dir = dirname(fileURLToPath(import.meta.url)) + '/../../dist/'

        this.app.use('/telescope/app.js', express.static(dir + "app.js"))
        this.app.use('/telescope/app.css', express.static(dir + "app.css"))
        this.app.use('/telescope/app-dark.css', express.static(dir + "app-dark.css"))
        this.app.use('/telescope/favicon.ico', express.static(dir + "favicon.ico"))

        this.app.use('/telescope/*', express.static(dir + 'index.html'))
        this.app.get('/telescope/', (request, response) => response.redirect('/telescope/requests'))
    }
}