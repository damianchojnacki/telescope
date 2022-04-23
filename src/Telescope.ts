import { Express } from 'express'
import DB from './DB.js';

export default class Telescope
{
    app: Express;

    public static setup(app: Express) {
        const telescope = new Telescope(app)
        telescope.setUpRoutes()
    }

    constructor(app: Express)
    {
        this.app = app
    }

    public setUpRoutes() {
        this.app.get('/telescope', (request, response) => {
            response.send('Telescope')
        })

        this.app.get('/telescope/telescope-api/requests', async (request, response) => {
            const entries = await DB.requests().get()

            response.send(entries)
        })

        this.app.get('/telescope/telescope-api/errors', async (request, response) => {
            const entries = await DB.errors().get()

            response.send(entries)
        })
    }
}