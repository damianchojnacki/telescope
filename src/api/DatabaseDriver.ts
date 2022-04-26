import WatcherEntry, {WatcherType} from "./WatcherEntry.js"

export default interface LowDriver
{
    get<T extends WatcherType>(name: WatcherEntry<T>['collection']): Promise<WatcherEntry<T>[]>

    find<T extends WatcherType>(name: WatcherEntry<T>['collection'], id: string): Promise<WatcherEntry<T> | undefined>

    batch(batchId: string): Promise<WatcherEntry<any>[]>

    save<T extends WatcherType>(name: WatcherEntry<T>['collection'], data: WatcherEntry<T>): Promise<void>

    update<T extends keyof WatcherType>(name: WatcherEntry<T>['collection'], index: number, toUpdate: WatcherEntry<T>): Promise<void>

    truncate(): void
}