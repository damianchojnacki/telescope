import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType} from "../WatcherEntry.js"
import DB from "../DB.js"

export interface DumpWatcherData
{
    dump: string
}

export class DumpWatcherEntry extends WatcherEntry<DumpWatcherData>
{
    constructor(data: DumpWatcherData)
    {
        super(WatcherEntryDataType.dumps, data)
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
        this.data = data
    }

    public save()
    {
        const entry = new DumpWatcherEntry({
            dump: this.data
        })

        DB.dumps().save(entry)
    }
}