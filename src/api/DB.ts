import {RequestWatcherData} from "./RequestWatcher.js";
import LowDriver from "./LowDriver.js";
import {ErrorWatcherData} from "./ErrorWatcher.js";
import DatabaseDriver from "./DatabaseDriver.js";
import {DumpWatcherData} from './DumpWatcher';
import {ClientRequestWatcherData} from "./ClientRequestWatcher.js";
import WatcherEntry from "./WatcherEntry.js";
import {LogWatcherData} from "./LogWatcher";

export type WatcherEntryType = "request" | "exception" | "dump" | "client-request"

export enum WatcherEntryDataType {
    requests = "request",
    exceptions = "exception",
    dumps = "dump",
    logs = "log",
    "client-requests" = "client-request",
}

export enum WatcherEntryCollectionType {
    request = "requests",
    exception = "exceptions",
    dump = "dumps",
    log = "logs",
    "client-request" = "client-requests",
}

export interface WatcherData {
    requests: WatcherEntry<RequestWatcherData>[]
    exceptions: WatcherEntry<ErrorWatcherData>[]
    dumps: WatcherEntry<DumpWatcherData>[]
    logs: WatcherEntry<LogWatcherData>[]
    "client-requests": WatcherEntry<ClientRequestWatcherData>[]
}

export type WatcherType =
    RequestWatcherData |
    ErrorWatcherData |
    DumpWatcherData |
    ClientRequestWatcherData |
    LogWatcherData

class DB {
    private static db: DatabaseDriver

    private constructor() {
        DB.db = new LowDriver()
    }

    private static async get(): Promise<DatabaseDriver> {
        if (!DB.db) {
            new DB()
        }

        return DB.db;
    }

    public static entry<T extends WatcherType, U extends WatcherEntry<T>>(name: WatcherEntry<T>['collection']) {
        return {
            get: async () => (await DB.get()).get(name),
            find: async (id: string) => (await DB.get()).find(name, id),
            save: async (data: WatcherEntry<T>) => (await DB.get()).save(name, data),
        }
    }

    public static async batch(batchId: string)
    {
        return (await DB.get()).batch(batchId);
    }

    public static async truncate() {
        return (await DB.get()).truncate();
    }

    public static requests() {
        return this.entry(WatcherEntryCollectionType.request)
    }

    public static errors() {
        return this.entry(WatcherEntryCollectionType.exception)
    }

    public static dumps() {
        return this.entry(WatcherEntryCollectionType.dump)
    }

    public static logs() {
        return this.entry(WatcherEntryCollectionType.log)
    }

    public static clientRequests() {
        return this.entry(WatcherEntryCollectionType['client-request'])
    }
}

export default DB;