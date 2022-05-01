import DatabaseDriver from "./DatabaseDriver.js";
import WatcherEntry, { WatcherEntryCollectionType, WatcherType } from "../WatcherEntry.js";
export default class MemoryDriver implements DatabaseDriver {
    private db;
    constructor();
    get<T extends WatcherType>(name: WatcherEntryCollectionType): Promise<WatcherEntry<T>[]>;
    find<T extends WatcherType>(name: WatcherEntryCollectionType, id: string): Promise<WatcherEntry<T> | undefined>;
    batch(batchId: string): Promise<WatcherEntry<any>[]>;
    save<T extends keyof WatcherType>(name: WatcherEntryCollectionType, data: WatcherEntry<T>): Promise<void>;
    update<T extends keyof WatcherType>(name: WatcherEntryCollectionType, index: number, toUpdate: WatcherEntry<T>): Promise<void>;
    truncate(): Promise<void>;
}
