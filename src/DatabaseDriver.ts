import { ErrorWatcherData } from "./ErrorWatcher.js";
import { RequestWatcherData } from "./RequestWatcher.js";
import { WatcherType, WatcherData } from "./DB.js";

export default interface LowDriver
{
  get(name: keyof WatcherData): Promise<WatcherType[]>

  save(name: keyof WatcherData, data: WatcherType): Promise<void>
}