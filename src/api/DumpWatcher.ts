import DB, {WatcherEntryCollectionType, WatcherEntryDataType} from "./DB.js";
import WatcherEntry from "./WatcherEntry.js";
import {parse, stringify} from 'flatted';

export interface DumpWatcherData
{
    dump: string
}

export class DumpWatcherEntry extends WatcherEntry<DumpWatcherData>
{
    collection = WatcherEntryCollectionType.dump

    constructor(data: DumpWatcherData) {
        super(WatcherEntryDataType.requests, data);
    }
}

export function dump(data: any): void
{
    const watcher = new DumpWatcher(data)

    watcher.save()
}

export default class DumpWatcher
{
    private data: any

    constructor(data: any)
    {
        this.data = JSON.parse(stringify(data))
    }

    public save()
    {
        const entry = new DumpWatcherEntry({
            dump: this.data
        })

        DB.dumps().save(entry);
    }
}