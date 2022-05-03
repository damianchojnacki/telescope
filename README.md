# Node.js Telescope

![Express version >= 4.0.0](https://img.shields.io/badge/express-%3E%3D%204.0.0-blue)
![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)


## Introduction
Node.js Telescope is an elegant debug assistant based on Telescope for Laravel framework. 
Telescope provides insight into the requests coming into your application, 
exceptions, console.log entries, variable dumps and more. Telescope makes a 
wonderful companion to your local development environment.

### [Laravel Telescope](https://github.com/laravel/telescope)

![User interface](https://camo.githubusercontent.com/01232f71f11388af662f685d5b110b29517b1ebc15bb831404f9d4818ce1afdd/68747470733a2f2f6c61726176656c2e636f6d2f6173736574732f696d672f6578616d706c65732f53637265656e5f53686f745f323031382d31302d30395f61745f312e34372e32335f504d2e706e67)

## Docs
### 1. Installation

```npm
npm i @damianchojnacki/telescope
```

### 2. Usage
Setup Telescope BEFORE any route. Setup ErrorWatcher if needed at the end.

```javascript
import Telescope, { ErrorWatcher } from '@damianchojnacki/telescope'

const app = express()

const telescope = Telescope.setup(app)

app.get('/', (request, response) => {
    response.send('Hello world')
})

ErrorWatcher.setup(telescope)
```

#### RequestWatcher

Intercepts requests and responses.

#### LogWatcher

Intercepts console messages.

`console.log` - creates `info` level log
`console.warn` - creates `warning` level log
`console.table` - creates `info` level table log

```javascript
console.log(message, ...content)
```

#### ClientRequestWatcher

Intercepts axios requests and responses.

#### ErrorWatcher

Logs unhandled errors.

#### DumpWatcher

Saves dump messages.

```javascript
import { dump } from "@damianchojnacki/telescope"

dump("foo")
```

You can access telescope panel at `/telescope`.

### 3. Note about ErrorWatcher (only express < 5.0.0)

Unhandled exception thrown in async function causes that Telescope will is unable to create associated request:
See [Express docs](http://expressjs.com/en/advanced/best-practice-performance.html#use-promises) <br><br>
`WRONG ❌`
```javascript
app.get('/', async (request, response) => {
    await someAsyncFuncThatThrowsException()
    
    response.send('Hello world')
})
```

`GOOD ✅`
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

```javascript
Telescope.setup(app, {
    enabledWatchers: {
        RequestWatcher,
        ErrorWatcher,
        ClientRequestWatcher,
        DumpWatcher,
        LogWatcher,
    },
    responseSizeLimit: 128,
    paramsToHide: [
        'password',
        '_csrf'
    ],
    ignorePaths: [
        '/admin*',
        '/docs'
    ],
    ignoreErrors: [
        TypeError
    ],
    isAuthorized: (request, response, next) => {
        if(!request.isAuthenticated()){
            response.redirect('/login')

            return
        }
        
        next()
    },
    getUser: (request) => request.user, // {id: 1, email: 'user@example.com', name: 'John'}
})
```
`enabledWatchers` - list of enabled watchers

`responseSizeLimit` - response size limit (KB).
If limit is exceed watcher will not log response body.

`paramsToHide` - filter sensitive data,
If paramsToFilter matches request param it will be converted to *******.

`ignorePaths` - paths to ignore, exact paths or wildcard can be specified

`ignoreErrors` - errors to ignore

`isAuthorized` - be default telescope is disabled on production, if you want to change this behaviour you can provide custom isAuthorized function

`getUser` - telescope will display provided user on the request preview page, id is required, name and email are optional

#### Database drivers
Customizing database driver:
```javascript
import { MemoryDriver } from "@damianchojnacki/telescope"

const telescope = Telescope.setup(app, {
    databaseDriver: MemoryDriver
})
```

At the moment available are two drivers:
1. LowDriver (LowDB) - data is stored in json file and persist between application restart.
2. MemoryDriver - data is stored in memory and will be lost after application restart.

Feel free to create custom driver. It must implement `DatabaseDriver`:
```typescript
get<T extends WatcherType>(name: WatcherEntryCollectionType, take?: number): Promise<WatcherEntry<T>[]>

find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>

batch(batchId: string): Promise<WatcherEntry<any>[]>

save<T extends WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>): Promise<void>

update<T extends keyof WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>): Promise<void>

truncate(): Promise<void>
```

## License

Node.js Telescope is open-sourced software licensed under the [MIT license](LICENSE.md).
