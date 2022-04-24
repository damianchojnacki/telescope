import express from 'express'
import DB from './api/DB.js';
import RequestWatcher from './api/RequestWatcher.js';
import ErrorWatcher from './api/ErrorWatcher.js';
import Telescope from './api/Telescope.js';
import { dump } from './api/DumpWatcher.js';
import axios from 'axios';

const app = express()
const port = process.env.PORT || 3000;

Telescope.setup(app)

app.use(RequestWatcher.capture)

app.get('/', (request, response) => {
  axios.get('https://swapi.dev/api/people')

  response.send('Hello World!')
})

app.get('/error', (request, response) => {
  throw new Error('lolek')
})

app.get('/get', async (request, response) => {
  response.json((await DB.requests().get()))
})

app.use(ErrorWatcher.capture)

app.listen(port)