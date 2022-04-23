import express from 'express'
import DB from './DB.js';
import RequestWatcher from './RequestWatcher.js';
import ErrorWatcher from './ErrorWatcher.js';
import Telescope from './Telescope.js';

const app = express()
const port = process.env.PORT || 3000;

Telescope.setup(app)

app.use(RequestWatcher.capture)

app.get('/', (request, response) => {
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