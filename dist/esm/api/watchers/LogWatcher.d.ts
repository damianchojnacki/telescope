import WatcherEntry, { WatcherEntryCollectionType } from "../WatcherEntry.js";
import Telescope from "../Telescope.js";
export declare enum LogLevel {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error"
}
export interface LogWatcherData {
    context: object | any[];
    hostname: string;
    level: LogLevel;
    message: string;
}
export declare class LogWatcherEntry extends WatcherEntry<LogWatcherData> {
    constructor(data: LogWatcherData, batchId?: string);
}
export default class LogWatcher {
    static entryType: WatcherEntryCollectionType;
    private data;
    private batchId?;
    constructor(data: any[], level: LogLevel, batchId?: string);
    static capture(telescope: Telescope): void;
    save(): void;
    private getMessage;
}
