import { Express } from 'express'
import DB from './DB.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unlink, unlinkSync } from 'fs';
import ClientRequestWatcher from './ClientRequestWatcher.js';

export default class Telescope
{
    app: Express;

    public static setup(app: Express) {
        const telescope = new Telescope(app)

        telescope.setUpApi()
        telescope.setUpStaticFiles()

        ClientRequestWatcher.capture()
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

        this.app.use('/telescope', express.static(dir + 'index.html'));
        this.app.use('/telescope/', express.static(dir + 'index.html'));
        this.app.use('/telescope/*', express.static(dir + 'index.html'));
    }

    public setUpApi() {
        this.app.post('/telescope/telescope-api/:entry', async (request, response) => {
            // @ts-ignore
            const entries = await DB.entry(request.params.entry).get()

            response.json({
                entries: entries?.slice(0, Number(request.query.take ?? 50)),
                status: "enabled"
            })
        })

        this.app.get('/telescope/telescope-api/:entry/:id', async (request, response) => {
            // @ts-ignore
            const entry = await DB.entry(request.params.entry).find(request.params.id)

            response.json({
                entry,
                batch: []
            })
        })

        this.app.delete("/telescope/telescope-api/entries", async (request, response) => {
            DB.truncate()

            response.send("OK")
        })
    }
}