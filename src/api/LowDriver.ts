import DatabaseDriver from "./DatabaseDriver.js";
import { Low, JSONFile, JSONFileSync, LowSync } from 'lowdb'
import { WatcherType, WatcherData } from "./DB.js";
import { v4 as uuidv4 } from 'uuid';
import { threadId } from "worker_threads";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { unlinkSync } from "fs";

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
      exceptions: [],
      dumps: [], 
      "client-requests": [],
    }

    return this.db.data[name] ?? []
  }

  public async find(name: keyof WatcherData, id: string)
  {
    this.db.read()

    this.db.data ||= { 
      requests: [],
      exceptions: [],
      dumps: [],  
      "client-requests": [],
    }

    return this.db.data[name].find((entry) => entry.id === id)
  }

  public async save(name: keyof WatcherData, data: WatcherType)
  {
    this.db.read()

    this.db.data ||= { 
      requests: [],
      exceptions: [],
      dumps: [],  
      "client-requests": [],
    }

    this.db.data[name]?.unshift({
      id: uuidv4(),
      created_at: new Date().toISOString(),
      family_hash: '',
      sequence: Math.round(Math.random() * 100000),
      tags: [],
      type: name == "requests" ? 'request' : "exception",
      content: data
    })
    
    this.db.write()
  }

  public async truncate()
  {
    const dir = dirname(fileURLToPath(import.meta.url)) + '/../../db.json';
            
    unlinkSync(dir);
  }
}