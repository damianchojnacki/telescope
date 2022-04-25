import {v4 as uuidv4} from "uuid";
import {WatcherData, WatcherEntryCollectionType, WatcherEntryDataType, WatcherEntryType, WatcherType} from "./DB";

export interface WatcherEntryI<T extends WatcherType>
{
    id: string
    created_at: string
    family_hash: string
    sequence: number
    tags: string[]
    type: WatcherEntryType
    content: T
}

export default abstract class WatcherEntry<T extends WatcherType> implements WatcherEntryI<T>
{
    content: any;
    created_at: string;
    family_hash: string;
    id: string;
    sequence: number;
    tags: string[];
    type: WatcherEntryType;
    abstract collection: WatcherEntryCollectionType;

    protected constructor(name: WatcherEntryDataType, data: WatcherType) {
        this.id = uuidv4()
        this.created_at = new Date().toISOString()
        this.family_hash = ''
        this.sequence = Math.round(Math.random() * 100000)
        this.tags = []
        this.type = name
        this.content = data
    }
}