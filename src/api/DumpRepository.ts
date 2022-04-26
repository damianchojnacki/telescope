import {DumpWatcherEntry} from "./DumpWatcher"

export default class DumpRepository
{
    static instance: DumpRepository
    dumps: DumpWatcherEntry[] = []

    public static get(): DumpRepository
    {
        if (!DumpRepository.instance) {
            DumpRepository.instance = new DumpRepository()
        }

        return DumpRepository.instance
    }

    public all(): DumpWatcherEntry[]
    {
        return this.dumps
    }

    public add(entry: DumpWatcherEntry): void
    {
        this.dumps.unshift(entry)
    }
}