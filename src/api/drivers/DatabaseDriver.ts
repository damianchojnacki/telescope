import WatcherEntry, {WatcherEntryCollectionType, WatcherType} from "../WatcherEntry.js"

export default interface DatabaseDriver
{
    get<T extends WatcherType>(name: WatcherEntryCollectionType, take?: number): Promise<WatcherEntry<T>[]>

    find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>

    batch(batchId: string): Promise<WatcherEntry<any>[]>

    save<T extends WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>): Promise<void>

    update<T extends WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>): Promise<void>

    truncate(): Promise<void>
}