import WatcherEntry, {WatcherEntryCollectionType, WatcherType} from "../WatcherEntry.js"
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

export default interface DatabaseDriver
{
    get<T extends WatcherType>(name: WatcherEntryCollectionType, take?: number): Promise<WatcherEntry<T>[]>

    find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>

    batch(batchId: string): Promise<WatcherEntry<any>[]>

    save<T extends WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>): Promise<void>

    update<T extends WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>): Promise<void>

    truncate(): Promise<void>
}