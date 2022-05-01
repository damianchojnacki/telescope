export default class JSONFileSyncAdapter<T> {
    #private;
    constructor(filename: string);
    static getRefReplacer: () => (key: string, value: any) => any;
    read(): T | null;
    write(obj: T): void;
}
