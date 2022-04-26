import {Express, Request} from 'express'
import DB, {WatcherEntryCollectionType} from './DB.js';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ClientRequestWatcher from "./ClientRequestWatcher.js";
import LogWatcher from "./LogWatcher.js";
import RequestWatcher from "./RequestWatcher.js";
import {v4 as uuidv4} from "uuid";

export default class Telescope
{
    private static watcherEntries = [
        WatcherEntryCollectionType.request,
        WatcherEntryCollectionType.exception,
        WatcherEntryCollectionType.dump,
        WatcherEntryCollectionType.log,
        WatcherEntryCollectionType['client-request'],
    ]

    public app: Express
    public batchId?: string
    public startTime?: [number, number]

    public static setup(app: Express, watcherEntries?: WatcherEntryCollectionType[]) {
        if(watcherEntries){
            Telescope.watcherEntries = watcherEntries
        }

        const telescope = new Telescope(app)

        telescope.setUpApi()
        telescope.setUpStaticFiles()

        app.use((request, response, next) => {
            telescope.batchId = uuidv4()
            telescope.startTime = process.hrtime()

            Telescope.watcherEntries.includes(WatcherEntryCollectionType.request)
                && RequestWatcher.capture(request, response, telescope.batchId)

            next()
        })

        Telescope.watcherEntries.includes(WatcherEntryCollectionType["client-request"])
            && ClientRequestWatcher.capture(telescope)

        Telescope.watcherEntries.includes(WatcherEntryCollectionType.log)
            && LogWatcher.capture(telescope)

        return telescope
    }

    constructor(app: Express)
    {
        this.app = app
    }

    private setUpStaticFiles()
    {
        const dir = dirname(fileURLToPath(import.meta.url)) + '/../../dist/';

        this.app.use('/telescope/app.js', express.static(dir + "app.js"));
        this.app.use('/telescope/app.css', express.static(dir + "app.css"));
        this.app.use('/telescope/app-dark.css', express.static(dir + "app-dark.css"));
        this.app.use('/telescope/favicon.ico', express.static(dir + "favicon.ico"));

        this.app.use('/telescope/*', express.static(dir + 'index.html'));
        this.app.get('/telescope/', (request, response) => response.redirect('/telescope/requests'))
    }

    public setUpApi()
    {
        this.app.post('/telescope/telescope-api/:entry', async (request, response) => {
            const entries = await DB.entry(request.params.entry as WatcherEntryCollectionType).get()

            response.json({
                entries: entries?.slice(0, Number(request.query.take ?? 50)),
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
            DB.truncate()

            response.send("OK")
        })

        this.app.get("/telescope/telescope-api/entries", async (request, response) => {
            const enabled = Telescope.watcherEntries;

            response.json({
                enabled
            })
        })
    }
}