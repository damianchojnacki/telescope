import DatabaseDriver, {WatcherData} from "./DatabaseDriver.js"
import WatcherEntry, {WatcherEntryCollectionType, WatcherType} from "../WatcherEntry.js"

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

    public async get<T extends WatcherType>(name: WatcherEntryCollectionType): Promise<WatcherEntry<T>[]>
    {
        return this.db[name] ?? []
    }

    public async find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>
    {
        return this.db[name]?.find((entry: WatcherEntry<T>) => entry.id === id)
    }

    public async batch(batchId: string): Promise<WatcherEntry<any>[]>
    {
        const batch: WatcherEntry<any>[] = []

        Object.keys(this.db).forEach((key) => {
            // @ts-ignore
            batch.push(this.db[key])
        })

        return batch.flat().filter((entry) => entry.batchId === batchId)
    }

    public async save<T extends keyof WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>)
    {
        this.db[name]?.unshift(data)
    }

    public async update<T extends keyof WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>)
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