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
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryDriver {
    constructor() {
        this.db = {
            requests: [],
            exceptions: [],
            dumps: [],
            logs: [],
            "client-requests": [],
        };
    }
    get(name) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this.db[name]) !== null && _a !== void 0 ? _a : [];
        });
    }
    find(name, id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this.db[name]) === null || _a === void 0 ? void 0 : _a.find((entry) => entry.id === id);
        });
    }
    batch(batchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = [];
            Object.keys(this.db).forEach((key) => {
                // @ts-ignore
                batch.push(this.db[key]);
            });
            return batch.flat().filter((entry) => entry.batchId === batchId);
        });
    }
    save(name, data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.db[name]) === null || _a === void 0 ? void 0 : _a.unshift(data);
        });
    }
    update(name, index, toUpdate) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.db[name].splice(index, 1);
            (_a = this.db[name]) === null || _a === void 0 ? void 0 : _a.unshift(toUpdate);
        });
    }
    truncate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = {
                requests: [],
                exceptions: [],
                dumps: [],
                logs: [],
                "client-requests": [],
            };
        });
    }
}
exports.default = MemoryDriver;
