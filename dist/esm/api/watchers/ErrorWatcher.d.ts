import WatcherEntry, { WatcherEntryCollectionType } from "../WatcherEntry.js";
import Telescope from "../Telescope.js";
export interface ErrorWatcherData {
    hostname: string;
    class: string;
    file: string;
    message: string;
    trace: object[];
    line_preview: object;
    line: number;
    occurrences: number;
}
export declare class ErrorWatcherEntry extends WatcherEntry<ErrorWatcherData> {
    constructor(data: ErrorWatcherData, batchId?: string);
}
export default class ErrorWatcher {
    static entryType: WatcherEntryCollectionType;
    static ignoreErrors: ErrorConstructor[];
    private error;
    private batchId?;
    constructor(error: Error, batchId?: string);
    static setup(telescope: Telescope): void;
    private getSameError;
    saveOrUpdate(): Promise<void>;
    private isSameError;
    shouldIgnore(): boolean;
    private getFileInfo;
    private getLinePreview;
    private getStackTrace;
}
