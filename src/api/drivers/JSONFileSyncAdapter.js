"use strict";
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
exports.__esModule = true;
exports.JSONFileSyncAdapter = void 0;
var lowdb_1 = require("lowdb");
var JSONFileSyncAdapter = /** @class */ (function () {
    function JSONFileSyncAdapter(filename) {
        _JSONFileSyncAdapter_adapter.set(this, void 0);
        __classPrivateFieldSet(this, _JSONFileSyncAdapter_adapter, new lowdb_1.TextFileSync(filename), "f");
    }
    JSONFileSyncAdapter.prototype.read = function () {
        var data = __classPrivateFieldGet(this, _JSONFileSyncAdapter_adapter, "f").read();
        if (data === null) {
            return null;
        }
        else {
            return JSON.parse(data);
        }
    };
    JSONFileSyncAdapter.prototype.write = function (obj) {
        __classPrivateFieldGet(this, _JSONFileSyncAdapter_adapter, "f").write(JSON.stringify(obj, JSONFileSyncAdapter.getRefReplacer(), 2));
    };
    var _JSONFileSyncAdapter_adapter;
    _JSONFileSyncAdapter_adapter = new WeakMap();
    JSONFileSyncAdapter.getRefReplacer = function () {
        var seen = new WeakSet();
        return function (key, value) {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    };
    return JSONFileSyncAdapter;
}());
exports.JSONFileSyncAdapter = JSONFileSyncAdapter;
