import DatabaseDriver from "./DatabaseDriver.js"
import WatcherEntry, {WatcherType} from "../WatcherEntry.js"
import {RequestWatcherData} from "../watchers/RequestWatcher.js"
import {ErrorWatcherData} from "../watchers/ErrorWatcher.js"
import {DumpWatcherData} from "../watchers/DumpWatcher.js"
import {LogWatcherData} from "../watchers/LogWatcher.js"
import {ClientRequestWatcherData} from "../watchers/ClientRequestWatcher.js"

export interface WatcherData
{
    requests: WatcherEntry<RequestWatcherData>[]
    exceptions: WatcherEntry<ErrorWatcherData>[]
    dumps: WatcherEntry<DumpWatcherData>[]
    logs: WatcherEntry<LogWatcherData>[]
    "client-requests": WatcherEntry<ClientRequestWatcherData>[]
}

export default class MemoryDriver implements DatabaseDriver
{
    private db: WatcherData

    constructor()
    {
        this.db = {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }
    }

    public async get<T extends WatcherType>(name: WatcherEntry<T>['collection']): Promise<WatcherEntry<T>[]>
    {
        return this.db[name] ?? []
    }

    public async find<T extends WatcherType>(name: WatcherEntry<T>['collection'], id: string): Promise<WatcherEntry<T> | undefined>
    {
        return this.db[name]?.find((entry: WatcherEntry<T>) => entry.id === id)
    }

    public async batch(batchId: string): Promise<WatcherEntry<any>[]>
    {
        const batch: WatcherEntry<any>[] = []

        Object.keys(this.db).forEach((key) =>
        {
            // @ts-ignore
            batch.push(this.db[key])
        })

        return batch.flat().filter((entry) => entry.batchId === batchId)
    }

    public async save<T extends keyof WatcherType>(name: WatcherEntry<T>['collection'], data: WatcherEntry<T>)
    {
        this.db[name]?.unshift(data)
    }

    public async update<T extends keyof WatcherType>(name: WatcherEntry<T>['collection'], index: number, toUpdate: WatcherEntry<T>)
    {
        this.db[name].splice(index, 1)
        this.db[name]?.unshift(toUpdate)
    }

    public async truncate()
    {
        this.db = {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }
    }
}