import { RequestWatcherData } from "./RequestWatcher.js";
import { join, dirname } from 'path'
import { Low, JSONFile, JSONFileSync, LowSync } from 'lowdb'
import { fileURLToPath } from 'url'
import LowDriver from "./LowDriver.js";
import { ErrorWatcherData } from "./ErrorWatcher.js";
import DatabaseDriver from "./DatabaseDriver.js";

export interface WatcherData
{
  requests: RequestWatcherData[]
  errors: ErrorWatcherData[]
}

export type WatcherType = RequestWatcherData | ErrorWatcherData;

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

  public static requests()
  {
      return {
          get: async () => (await DB.get()).get("requests"),
          save: async (data: WatcherType) => (await DB.get()).save("requests", data),
      }
  }

  public static errors()
  {
      return {
          get: async () => (await DB.get()).get("errors"),
          save: async (data: WatcherType) => (await DB.get()).save("errors", data),
      }
  }
}

export default DB;