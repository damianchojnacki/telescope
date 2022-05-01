import express, {NextFunction, Request, Response} from 'express'
import Telescope, {ErrorWatcher} from '../index.js'
import axios from "axios"

const app = express()
const port = process.env.PORT || 3000;

const telescope = Telescope.setup(app)

app.get('/', (request, response, next) => {
    response.send('Hello world')
})

app.get('/swapi', async (request, response, next) => {
  try{
      const swapi = await axios.get('https://swapi.dev/api/people')

      console.table(swapi.data.results)

      response.send(swapi.data.results[0])
  } catch (e){
      next(e)

      response.send('Error')
  }
})

app.get('/log', (request, response, next) => {
    const body = new Date().toDateString()

    console.log(body)

    response.send(body)
})

app.get('/error', (request, response, next) => {
    throw new TypeError('Example error')
})

app.use((request: Request, response: Response, next: NextFunction) => {
    next()

    response.status(404).send('Not found')
})

app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
    next(error)

    response.status(500).send('Server error')
})

ErrorWatcher.setup(telescope)

app.listen(port)