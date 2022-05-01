"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const JSONFileSyncAdapter_js_1 = __importDefault(require("./JSONFileSyncAdapter.js"));
class LowDriver {
    constructor() {
        this.db = {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        };
        this.adapter = new JSONFileSyncAdapter_js_1.default('db.json');
        this.adapter.read();
    }
    read() {
        var _a;
        this.db = (_a = this.adapter.read()) !== null && _a !== void 0 ? _a : this.db;
    }
    write() {
        this.adapter.write(this.db);
    }
    get(name, take) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.read();
            return (_a = (take ? this.db[name].slice(0, take) : this.db[name])) !== null && _a !== void 0 ? _a : [];
        });
    }
    find(name, id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.read();
            return this.db[name].find((entry) => entry.id === id);
        });
    }
    batch(batchId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.read();
            const batch = [];
            Object.keys(this.db).forEach((key) => {
                // @ts-ignore
                batch.push(this.db[key]);
            });
            return batch.flat().filter((entry) => entry.batchId === batchId);
        });
    }
    save(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.read();
            this.db[name].unshift(data);
            this.write();
        });
    }
    update(name, index, toUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.read();
            this.db[name].splice(index, 1);
            this.db[name].unshift(toUpdate);
            this.write();
        });
    }
    truncate() {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = process.cwd() + '/db.json';
            (0, fs_1.unlinkSync)(dir);
        });
    }
}
exports.default = LowDriver;
