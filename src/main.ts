import express, {NextFunction, Request, Response} from 'express'
import DB from './api/DB.js';
import ErrorWatcher from './api/watchers/ErrorWatcher.js';
import Telescope from './api/Telescope.js';
import {dump} from "./api/watchers/DumpWatcher.js"
import axios from "axios"
import RequestWatcher from "./api/watchers/RequestWatcher.js"

const app = express()
const port = process.env.PORT || 3000;

const telescope = Telescope.setup(app)

app.get('/', (request, response, next) => {
    //axios.get('https://httpbin.org/status/200').catch((err) => next(err))

    console.log('LOL')

  response.send('lol')
})

app.get('/error', (request, response, next) => {
    throw new TypeError('lolek')
})

app.get('/get', async (request, response) => {
  response.json((await DB.requests().get()))
})

ErrorWatcher.setup(telescope)

app.listen(port)