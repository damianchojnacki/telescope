import express from 'express'
import DB from './api/DB.js';
import ErrorWatcher from './api/watchers/ErrorWatcher.js';
import Telescope from './api/Telescope.js';
import {dump} from "./api/watchers/DumpWatcher.js"
import axios from "axios"

const app = express()
const port = process.env.PORT || 3000;

const telescope = Telescope.setup(app)

app.get('/', async (request, response) => {
  response.send('lol')
})

app.get('/error', async (request, response, next) => {
    throw new Error('lolek')
})

app.get('/get', async (request, response) => {
  response.json((await DB.requests().get()))
})

ErrorWatcher.setup(telescope)

app.listen(port)