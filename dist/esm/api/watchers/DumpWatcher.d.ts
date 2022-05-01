import WatcherEntry, { WatcherEntryCollectionType } from "../WatcherEntry.js";
export interface DumpWatcherData {
    dump: string;
}
export declare class DumpWatcherEntry extends WatcherEntry<DumpWatcherData> {
    constructor(data: DumpWatcherData);
}
export declare function dump(data: any): void;
export default class DumpWatcher {
    static entryType: WatcherEntryCollectionType;
    private data;
    constructor(data: any);
    save(): void;
}
