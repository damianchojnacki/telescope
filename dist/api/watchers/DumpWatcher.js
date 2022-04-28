import WatcherEntry, { WatcherEntryCollectionType, WatcherEntryDataType } from "../WatcherEntry.js";
import DB from "../DB.js";
export class DumpWatcherEntry extends WatcherEntry {
    constructor(data) {
        super(WatcherEntryDataType.dumps, data);
    }
}
export function dump(data) {
    const watcher = new DumpWatcher(data);
    watcher.save();
}
export default class DumpWatcher {
    constructor(data) {
        this.data = data;
    }
    save() {
        const entry = new DumpWatcherEntry({
            dump: this.data
        });
        DB.dumps().save(entry);
    }
}
DumpWatcher.entryType = WatcherEntryCollectionType.dump;
