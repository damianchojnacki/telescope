var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _JSONFileSyncAdapter_adapter;
import { TextFileSync } from "./TextFileSync.js";
export default class JSONFileSyncAdapter {
    constructor(filename) {
        _JSONFileSyncAdapter_adapter.set(this, void 0);
        __classPrivateFieldSet(this, _JSONFileSyncAdapter_adapter, new TextFileSync(filename), "f");
    }
    read() {
        const data = __classPrivateFieldGet(this, _JSONFileSyncAdapter_adapter, "f").read();
        if (data === null) {
            return null;
        }
        else {
            return JSON.parse(data);
        }
    }
    write(obj) {
        __classPrivateFieldGet(this, _JSONFileSyncAdapter_adapter, "f").write(JSON.stringify(obj, JSONFileSyncAdapter.getRefReplacer(), 2));
    }
}
_JSONFileSyncAdapter_adapter = new WeakMap();
JSONFileSyncAdapter.getRefReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    };
};
