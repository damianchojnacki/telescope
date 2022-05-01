import DatabaseDriver from "./drivers/DatabaseDriver.js";
import WatcherEntry, { WatcherEntryCollectionType, WatcherType } from "./WatcherEntry.js";
export declare type Driver = new () => DatabaseDriver;
declare class DB {
    static driver: Driver;
    private static db;
    private constructor();
    static entry<T extends WatcherType, U extends WatcherEntry<T>>(name: WatcherEntryCollectionType): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<T>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<T>) => Promise<void>;
    };
    static batch(batchId: string): Promise<WatcherEntry<any>[]>;
    static truncate(): Promise<void>;
    static requests(): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<WatcherType>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<WatcherType>) => Promise<void>;
    };
    static errors(): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<WatcherType>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<WatcherType>) => Promise<void>;
    };
    static dumps(): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<WatcherType>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<WatcherType>) => Promise<void>;
    };
    static logs(): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<WatcherType>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<WatcherType>) => Promise<void>;
    };
    static clientRequests(): {
        get: (take?: number | undefined) => Promise<WatcherEntry<WatcherType>[]>;
        find: (id: string) => Promise<WatcherEntry<WatcherType> | undefined>;
        save: (data: WatcherEntry<WatcherType>) => Promise<void>;
        update: (index: number, toUpdate: WatcherEntry<WatcherType>) => Promise<void>;
    };
    private static get;
}
export default DB;
