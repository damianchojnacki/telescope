import DatabaseDriver from "./DatabaseDriver.js"
import {JSONFileSync, LowSync} from 'lowdb'
import {dirname} from "path"
import {fileURLToPath} from "url"
import {unlinkSync} from "fs"
import WatcherEntry, {WatcherType} from "./WatcherEntry.js"
import {RequestWatcherData} from "./RequestWatcher.js"
import {ErrorWatcherData} from "./ErrorWatcher.js"
import {DumpWatcherData} from "./DumpWatcher.js"
import {LogWatcherData} from "./LogWatcher.js"
import {ClientRequestWatcherData} from "./ClientRequestWatcher.js"

export interface WatcherData
{
    requests: WatcherEntry<RequestWatcherData>[]
    exceptions: WatcherEntry<ErrorWatcherData>[]
    dumps: WatcherEntry<DumpWatcherData>[]
    logs: WatcherEntry<LogWatcherData>[]
    "client-requests": WatcherEntry<ClientRequestWatcherData>[]
}

export default class LowDriver implements DatabaseDriver
{
    private db: LowSync<WatcherData>

    constructor()
    {
        const adapter = new JSONFileSync<WatcherData>('db.json')

        this.db = new LowSync(adapter)
    }

    public async get<T extends WatcherType>(name: WatcherEntry<T>['collection']): Promise<WatcherEntry<T>[]>
    {
        this.db.read()

        this.db.data ||= {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }

        return this.db.data[name] ?? []
    }

    public async find<T extends WatcherType>(name: WatcherEntry<T>['collection'], id: string): Promise<WatcherEntry<T> | undefined>
    {
        this.db.read()

        this.db.data ||= {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }

        return this.db.data[name]?.find((entry: WatcherEntry<T>) => entry.id === id)
    }

    public async batch(batchId: string): Promise<WatcherEntry<any>[]>
    {
        this.db.read()

        this.db.data ||= {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }

        const batch: WatcherEntry<any>[] = []

        Object.keys(this.db.data).forEach((key) =>
        {
            // @ts-ignore
            batch.push(this.db.data[key])
        })

        return batch.flat().filter((entry) => entry.batchId === batchId)
    }

    public async save<T extends keyof WatcherType>(name: WatcherEntry<T>['collection'], data: WatcherEntry<T>)
    {
        this.db.read()

        this.db.data ||= {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }

        this.db.data[name]?.unshift(data)

        this.db.write()
    }

    public async update<T extends keyof WatcherType>(name: WatcherEntry<T>['collection'], index: number, toUpdate: WatcherEntry<T>)
    {
        this.db.read()

        this.db.data ||= {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        }

        this.db.data[name].splice(index, 1)
        this.db.data[name]?.unshift(toUpdate)

        this.db.write()
    }

    public async truncate()
    {
        const dir = dirname(fileURLToPath(import.meta.url)) + '/../../db.json'

        unlinkSync(dir)
    }
}