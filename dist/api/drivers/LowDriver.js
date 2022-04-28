var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LowSync } from 'lowdb';
import { unlinkSync } from "fs";
import { JSONFileSyncAdapter } from "./JSONFileSyncAdapter.js";
export default class LowDriver {
    constructor() {
        const adapter = new JSONFileSyncAdapter('db.json');
        this.db = new LowSync(adapter);
    }
    get(name, take) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.db.read();
            (_b = this.db).data || (_b.data = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            });
            return (_a = (take ? this.db.data[name].slice(0, take) : this.db.data[name])) !== null && _a !== void 0 ? _a : [];
        });
    }
    find(name, id) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.db.read();
            (_b = this.db).data || (_b.data = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            });
            return (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.find((entry) => entry.id === id);
        });
    }
    batch(batchId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.db.read();
            (_a = this.db).data || (_a.data = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            });
            const batch = [];
            Object.keys(this.db.data).forEach((key) => {
                // @ts-ignore
                batch.push(this.db.data[key]);
            });
            return batch.flat().filter((entry) => entry.batchId === batchId);
        });
    }
    save(name, data) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.db.read();
            (_b = this.db).data || (_b.data = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            });
            (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.unshift(data);
            this.db.write();
        });
    }
    update(name, index, toUpdate) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.db.read();
            (_b = this.db).data || (_b.data = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            });
            this.db.data[name].splice(index, 1);
            (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.unshift(toUpdate);
            this.db.write();
        });
    }
    truncate() {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = process.cwd() + '/db.json';
            unlinkSync(dir);
        });
    }
}
