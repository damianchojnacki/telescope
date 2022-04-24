import { RequestWatcherData } from "./RequestWatcher.js";
import { join, dirname } from 'path'
import { Low, JSONFile, JSONFileSync, LowSync } from 'lowdb'
import { fileURLToPath } from 'url'
import LowDriver from "./LowDriver.js";
import { ErrorWatcherData } from "./ErrorWatcher.js";
import DatabaseDriver from "./DatabaseDriver.js";
import { DumpWatcherData } from './DumpWatcher';
import { ClientRequestWatcherData } from "./ClientRequestWatcher.js";

export type WatcherEntryType = "request" | "exception" | "dump" | "client-request"

export interface WatcherEntry
{
    id: string
    created_at: string
    family_hash: string
    sequence: number
    tags: string[]
    type: WatcherEntryType
    content: WatcherType
}

export interface WatcherData
{
  requests: WatcherEntry[]
  exceptions: WatcherEntry[]
  dumps: WatcherEntry[]
  "client-requests": WatcherEntry[]
}

export type WatcherType = RequestWatcherData | ErrorWatcherData | DumpWatcherData | ClientRequestWatcherData;

class DB
{
  private static db: DatabaseDriver

  private constructor(){
    DB.db = new LowDriver()
  }

  private static async get(): Promise<DatabaseDriver>
  {
    if(!DB.db){
        new DB()
    }

    return DB.db;
  }

  public static entry(name: keyof WatcherData)
  {
    return {
        get: async () => (await DB.get()).get(name),
        find: async (id: string) => (await DB.get()).find(name, id),
        save: async (data: WatcherType) => (await DB.get()).save(name, data),
    }
  }

  public static async truncate()
  {
      return (await DB.get()).truncate();
  }

  public static requests()
  {
      return this.entry("requests")
  }

  public static errors()
  {
    return this.entry("exceptions")
  }

  public static dumps()
  {
    return this.entry("dumps")
  }

  public static clientRequests()
  {
    return this.entry("client-requests")
  }
}

export default DB;