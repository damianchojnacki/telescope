import express from 'express'
import DB from './api/DB.js';
import RequestWatcher from './api/RequestWatcher.js';
import ErrorWatcher from './api/ErrorWatcher.js';
import Telescope from './api/Telescope.js';
import axios from 'axios';

const app = express()
const port = process.env.PORT || 3000;

app.use(RequestWatcher.capture)

Telescope.setup(app)

app.get('/', async (request, response) => {
  const res = await axios.get('https://swapi.dev/api/people')

  response.send(res.data)
})

app.get('/error', (request, response) => {
  throw new Error('lolek')
})

app.get('/get', async (request, response) => {
  response.json((await DB.requests().get()))
})

ErrorWatcher.setup()

app.listen(port)