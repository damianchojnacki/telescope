import { ErrorWatcherData } from "./ErrorWatcher.js";
import { RequestWatcherData } from "./RequestWatcher.js";
import { WatcherType, WatcherData } from "./DB.js";
import { WatcherEntry } from './DB';

export default interface LowDriver
{
  get(name: keyof WatcherData): Promise<WatcherEntry[]>

  find(name: keyof WatcherData, id: string): Promise<WatcherEntry | undefined>

  save(name: keyof WatcherData, data: WatcherType): Promise<void>

  truncate(): void
}