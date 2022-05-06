import express, {Express, NextFunction, Request, Response} from 'express'
import DB, {Driver} from './DB.js'
import ClientRequestWatcher from "./watchers/ClientRequestWatcher.js"
import LogWatcher from "./watchers/LogWatcher.js"
import RequestWatcher, {GetUserFunction} from "./watchers/RequestWatcher.js"
import {v4 as uuidv4} from "uuid"
import {WatcherEntryCollectionType} from "./WatcherEntry.js"
import ErrorWatcher from "./watchers/ErrorWatcher.js"
import DumpWatcher from "./watchers/DumpWatcher.js"
import {existsSync} from "fs"
import {fileURLToPath, resolve} from "url"
import * as url from "url"
import path from "path"

export type Watcher =
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
    paramsToHide?: string[]
    ignorePaths?: string[]
    clientIgnoreUrls?: string[]
    ignoreErrors?: ErrorConstructor[]
    isAuthorized?: (request: Request, response: Response, next: NextFunction) => void
    getUser?: GetUserFunction
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

    constructor(app: Express)
    {
        this.app = app
    }

    public static setup(app: Express, options?: TelescopeOptions)
    {
        Telescope.config(options ?? {})

        const telescope = new Telescope(app)

        app.use('/telescope', Telescope.isAuthorized)

        telescope.setUpApi()
        telescope.setUpStaticFiles()

        app.use((request, response, next) => {
            telescope.batchId = uuidv4()

            Telescope.enabledWatchers.includes(RequestWatcher)
            && RequestWatcher.capture(request, response, telescope.batchId, options?.getUser)

            next()
        })

        Telescope.enabledWatchers.includes(ClientRequestWatcher)
        && ClientRequestWatcher.capture(telescope)

        Telescope.enabledWatchers.includes(LogWatcher)
        && LogWatcher.capture(telescope)

        return telescope
    }

    public static config(options: TelescopeOptions)
    {
        if (options.enabledWatchers) {
            Telescope.enabledWatchers = options.enabledWatchers
        }

        if (options.isAuthorized) {
            Telescope.isAuthorized = options.isAuthorized
        }

        if (options.databaseDriver) {
            DB.driver = options.databaseDriver
        }

        if (options.responseSizeLimit) {
            RequestWatcher.responseSizeLimit = options.responseSizeLimit
        }

        if (options.ignorePaths) {
            RequestWatcher.ignorePaths = options.ignorePaths
        }

        if (options.paramsToHide) {
            RequestWatcher.paramsToHide = options.paramsToHide
        }

        if (options.ignoreErrors) {
            ErrorWatcher.ignoreErrors = options.ignoreErrors
        }

        if (options.clientIgnoreUrls) {
            ClientRequestWatcher.ignoreUrls = options.clientIgnoreUrls
        }
    }

    private static isAuthorized(request: Request, response: Response, next: NextFunction): void
    {
        if (process.env.NODE_ENV === "production") {
            response.status(403).send('Forbidden')

            return
        }

        next()
    }

    public static getEnabledWatchers(): string[]
    {
        return Telescope.enabledWatchers.map((watcher) => watcher.entryType)
    }

    private setUpApi()
    {
        this.app.post('/telescope/telescope-api/:entry', async (request, response) => {
            const entries = await DB.entry(request.params.entry as WatcherEntryCollectionType).get(Number(request.query.take ?? 50))

            response.json({
                entries,
                status: "enabled"
            })
        })

        this.app.get('/telescope/telescope-api/:entry/:id', async (request, response) => {
            const entry = await DB.entry(request.params.entry as WatcherEntryCollectionType).find(request.params.id)

            response.json({
                entry,
                batch: await DB.batch(entry?.batchId ?? '')
            })
        })

        this.app.delete("/telescope/telescope-api/entries", async (request, response) => {
            await DB.truncate()

            response.send("OK")
        })

        this.app.get("/telescope/telescope-api/entries", async (request, response) => {
            response.json({
                enabled: Telescope.getEnabledWatchers()
            })
        })
    }

    private resolveDir(): string
    {
        let dir = process.cwd() + '/node_modules/@damianchojnacki/telescope/dist/'

        if(!existsSync(dir + 'index.html')){
            dir = path.join(process.cwd(), '/dist/')
        }

        return dir
    }

    private setUpStaticFiles()
    {
        const dir = this.resolveDir()

        this.app.use('/telescope/app.js', express.static(dir + "app.js"))
        this.app.use('/telescope/app.css', express.static(dir + "app.css"))
        this.app.use('/telescope/app-dark.css', express.static(dir + "app-dark.css"))
        this.app.use('/telescope/favicon.ico', express.static(dir + "favicon.ico"))

        Telescope.getEnabledWatchers().forEach((watcher) => {
            this.app.use(`/telescope/${watcher}`, express.static(dir + 'index.html'))
            this.app.use(`/telescope/${watcher}/:id`, express.static(dir + 'index.html'))
        })

        this.app.get('/telescope/', (request, response) => response.redirect('/telescope/requests'))
    }
}