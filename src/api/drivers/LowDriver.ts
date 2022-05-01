import DatabaseDriver, {WatcherData} from "./DatabaseDriver.js"
import {unlinkSync} from "fs"
import WatcherEntry, {WatcherEntryCollectionType, WatcherType} from "../WatcherEntry.js"
import JSONFileSyncAdapter from "./JSONFileSyncAdapter.js"

export default class LowDriver implements DatabaseDriver
{
    private adapter: JSONFileSyncAdapter<WatcherData>
    private db: WatcherData = {
        requests: [],
        exceptions: [],
        dumps: [],
        logs: [],
        "client-requests": [],
    }

    constructor()
    {
        this.adapter = new JSONFileSyncAdapter<WatcherData>('db.json')

        this.adapter.read()
    }

    private read()
    {
        this.db = this.adapter.read() ?? this.db
    }

    private write()
    {
        this.adapter.write(this.db)
    }

    public async get<T extends WatcherType>(name: WatcherEntryCollectionType, take?: number): Promise<WatcherEntry<T>[]>
    {
        this.read()

        return (take ? this.db[name].slice(0, take) : this.db[name]) ?? []
    }

    public async find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>
    {
        this.read()

        return this.db[name].find((entry: WatcherEntry<T>) => entry.id === id)
    }

    public async batch(batchId: string): Promise<WatcherEntry<any>[]>
    {
        this.read()

        const batch: WatcherEntry<any>[] = []

        Object.keys(this.db).forEach((key) => {
            // @ts-ignore
            batch.push(this.db[key])
        })

        return batch.flat().filter((entry) => entry.batchId === batchId)
    }

    public async save<T extends keyof WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>)
    {
        this.read()

        this.db[name].unshift(data)

        this.write()
    }

    public async update<T extends keyof WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>)
    {
        this.read()

        this.db[name].splice(index, 1)
        this.db[name].unshift(toUpdate)

        this.write()
    }

    public async truncate()
    {
        const dir = process.cwd() + '/db.json'

        unlinkSync(dir)
    }
}