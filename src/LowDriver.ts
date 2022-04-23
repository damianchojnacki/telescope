import DatabaseDriver from "./DatabaseDriver.js";
import { Low, JSONFile, JSONFileSync, LowSync } from 'lowdb'
import { WatcherType, WatcherData } from "./DB.js";

export default class LowDriver implements DatabaseDriver
{
  private db: LowSync<WatcherData>

  constructor(){
    const adapter = new JSONFileSync<WatcherData>('db.json')

    this.db = new LowSync(adapter)
  }

  public async get(name: keyof WatcherData)
  {
    this.db.read()

    this.db.data ||= { 
      requests: [],
      errors: [] 
    }

    return this.db.data[name]
  }

  public async save(name: keyof WatcherData, data: WatcherType)
  {
    this.db.read()

    this.db.data ||= { 
      requests: [],
      errors: [] 
    }

    //@ts-ignore
    this.db.data[name].push(data)
    this.db.write()
  }
}