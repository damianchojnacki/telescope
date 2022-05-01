export declare class TextFileSync {
    #private;
    constructor(filename: string);
    read(): string | null;
    write(str: string): void;
}
