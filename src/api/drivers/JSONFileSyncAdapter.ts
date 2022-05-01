import {TextFileSync} from "./TextFileSync.js"

export default class JSONFileSyncAdapter<T>
{
    #adapter: TextFileSync

    constructor(filename: string)
    {
        this.#adapter = new TextFileSync(filename)
    }

    static getRefReplacer = () => {
        const seen = new WeakSet()
        return (key: string, value: any) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]'
                }
                seen.add(value)
            }
            return value
        }
    }

    read(): T | null
    {
        const data = this.#adapter.read()

        if (data === null) {
            return null
        } else {
            return JSON.parse(data) as T
        }
    }

    write(obj: T): void
    {
        this.#adapter.write(JSON.stringify(obj, JSONFileSyncAdapter.getRefReplacer(), 2))
    }
}