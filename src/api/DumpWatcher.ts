import DB from "./DB.js";

export interface DumpWatcherData
{
    dump: string
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
        DB.dumps().save({
            dump: this.data,
        });   
    }
}