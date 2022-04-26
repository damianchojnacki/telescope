# Node.js Telescope

![Express version >= 4.0.0](https://img.shields.io/badge/express-%3E%3D%204.0.0-blue)
![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)


## Introduction
Node.js Telescope is an elegant debug assistant based on Telescope for Laravel framework. 
Telescope provides insight into the requests coming into your application, 
exceptions, log entries, database queries, queued jobs, mail, notifications, 
cache operations, scheduled tasks, variable dumps and more. Telescope makes a 
wonderful companion to your local Laravel development environment.

### [Laravel Telescope](https://github.com/laravel/telescope)

![User interface](https://camo.githubusercontent.com/01232f71f11388af662f685d5b110b29517b1ebc15bb831404f9d4818ce1afdd/68747470733a2f2f6c61726176656c2e636f6d2f6173736574732f696d672f6578616d706c65732f53637265656e5f53686f745f323031382d31302d30395f61745f312e34372e32335f504d2e706e67)

## Docs
### 1. Installation

```npm
npm i @damianchojnacki/telescope
```

### 2. Usage
Setup Telescope AFTER creating new express app and BEFORE any route. Setup ErrorWatcher if needed at the end.

```javascript
import Telescope from './api/Telescope.js';

const app = express()

const telescope = Telescope.setup(app)

app.get('/', (request, response) => {
    response.send('Hello world')
})

ErrorWatcher.setup(telescope)
```

### 3. Note about ErrorWatcher (only express < 5.0.0)

Defining async route like below will cause that ErrorWatcher will be unable to create associated request:

`WRONG`
```javascript
app.get('/', async (request, response) => {
    await someAsyncFuncThatThrowsException()
    
    response.send('Hello world')
})
```

`GOOD`
```javascript
app.get('/', async (request, response, next) => {
    try{
        await someAsyncFuncThatThrowsException()
    } catch(error) {
        next(error)
    }
    
    response.send('Hello world')
})
```
### 4. Configuration

#### Enabled watchers

You can define enabled watchers by passing options to Telescope:

```javascript
const enabledWatchers = {
    WatcherEntryCollectionType.request,
    WatcherEntryCollectionType.exception,
    WatcherEntryCollectionType.dump,
    WatcherEntryCollectionType.log,
    WatcherEntryCollectionType.clientRequest,
}

const telescope = Telescope.setup(app, {
    enabledWatchers
})
```
#### Database drivers
You can define change database driver by passing options to Telescope:
```javascript
import MemoryDriver from "./api/drivers/MemoryDriver.js"

const telescope = Telescope.setup(app, {
    databaseDriver: MemoryDriver
})
```

At the moment available are two drivers:
1. LowDriver (LowDB) - data is stored in json file and persist between application restart.
2. MemoryDriver - data is stored in memory and will be lost after application restart.

## License

Node.js Telescope is open-sourced software licensed under the [MIT license](LICENSE.md).