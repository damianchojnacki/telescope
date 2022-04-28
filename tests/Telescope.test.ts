import express from "express"
import Telescope from "../src/api/Telescope.js"
import RequestWatcher from "../src/api/watchers/RequestWatcher.js"
import ErrorWatcher from "../src/api/watchers/ErrorWatcher.js"
import {WatcherEntryCollectionType} from "../src/api/WatcherEntry.js"
import request from "supertest"

describe('Telescope', () => {
    it('creates telescope instance', () => {
        const app = express()

        const telescope = Telescope.setup(app)

        expect(telescope).toBeInstanceOf(Telescope)
    })

    it('enables watchers', () => {
        const app = express()

        const telescope = Telescope.setup(app, {
            enabledWatchers: [
                RequestWatcher,
                ErrorWatcher
            ]
        })

        expect(
            telescope.getEnabledWatchers()
        ).toEqual([
            WatcherEntryCollectionType.request,
            WatcherEntryCollectionType.exception
        ])
    })

    it('serves static files', (done) => {
        const app = express()

        Telescope.setup(app)

        request(app)
            .get('/telescope/app.css')
            .expect(200, done)

        request(app)
            .get('/telescope/app-dark.css')
            .expect(200, done)

        request(app)
            .get('/telescope/app.js')
            .expect(200, done)

        request(app)
            .get('/telescope/favicon.ico')
            .expect(200, done)
    })

    it('serves watchers pages', (done) => {
        const app = express()

        const telescope = Telescope.setup(app)

        telescope.getEnabledWatchers().forEach((watcher) => {
            request(app)
                .get(`/telescope/${watcher}`)
                .expect(200, done)
        })
    })

    it('redirects to requests page from base route', (done) => {
        const app = express()

        Telescope.setup(app)

        request(app)
            .get(`/telescope`)
            .expect('Location', '/telescope/requests' , done)
    })
})