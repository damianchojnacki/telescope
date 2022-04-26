import LowDriver from "./drivers/LowDriver.js"
import DatabaseDriver from "./drivers/DatabaseDriver.js"
import WatcherEntry, {WatcherEntryCollectionType, WatcherType} from "./WatcherEntry.js"

export type Driver = new () => DatabaseDriver;

class DB
{
    private static db: DatabaseDriver
    public static driver: Driver = LowDriver

    private static async get(): Promise<DatabaseDriver>
    {
        if (!DB.db) {
            new DB()
        }

        return DB.db
    }

    private constructor()
    {
        DB.db = new DB.driver()
    }

    public static entry<T extends WatcherType, U extends WatcherEntry<T>>(name: WatcherEntryCollectionType)
    {
        return {
            get: async () => (await DB.get()).get(name),
            find: async (id: string) => (await DB.get()).find(name, id),
            save: async (data: WatcherEntry<T>) => (await DB.get()).save(name, data),
            update: async (index: number, toUpdate: WatcherEntry<T>) => (await DB.get()).update(name, index, toUpdate),
        }
    }

    public static async batch(batchId: string)
    {
        return (await DB.get()).batch(batchId)
    }

    public static async truncate()
    {
        return (await DB.get()).truncate()
    }

    public static requests()
    {
        return this.entry(WatcherEntryCollectionType.request)
    }

    public static errors()
    {
        return this.entry(WatcherEntryCollectionType.exception)
    }

    public static dumps()
    {
        return this.entry(WatcherEntryCollectionType.dump)
    }

    public static logs()
    {
        return this.entry(WatcherEntryCollectionType.log)
    }

    public static clientRequests()
    {
        return this.entry(WatcherEntryCollectionType['client-request'])
    }
}

export default DB