import {v4 as uuidv4} from "uuid";
import {WatcherData, WatcherEntryCollectionType, WatcherEntryDataType, WatcherEntryType, WatcherType} from "./DB.js";

export interface WatcherEntryI<T extends WatcherType>
{
    id: string
    batchId?: string,
    created_at: string
    family_hash: string
    sequence: number
    tags: string[]
    type: WatcherEntryDataType
    content: T
}

export default abstract class WatcherEntry<T extends WatcherType> implements WatcherEntryI<T>
{
    content: any
    created_at: string
    family_hash: string
    id: string
    batchId?: string
    sequence: number
    tags: string[]
    type: WatcherEntryDataType
    abstract collection: WatcherEntryCollectionType

    protected constructor(name: WatcherEntryDataType, data: WatcherType, batchId?: string) {
        this.id = uuidv4()
        this.created_at = new Date().toISOString()
        this.family_hash = ''
        this.sequence = Math.round(Math.random() * 100000)
        this.tags = []
        this.type = name
        this.content = data
        this.batchId = batchId
    }
}