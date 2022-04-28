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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var lowdb_1 = require("lowdb");
var fs_1 = require("fs");
var JSONFileSyncAdapter_js_1 = require("./JSONFileSyncAdapter.js");
var LowDriver = /** @class */ (function () {
    function LowDriver() {
        var adapter = new JSONFileSyncAdapter_js_1.JSONFileSyncAdapter('db.json');
        this.db = new lowdb_1.LowSync(adapter);
    }
    LowDriver.prototype.get = function (name, take) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                this.db.read();
                (_b = this.db).data || (_b.data = {
                    requests: [],
                    exceptions: [],
                    dumps: [],
                    logs: [],
                    "client-requests": []
                });
                return [2 /*return*/, (_a = (take ? this.db.data[name].slice(0, take) : this.db.data[name])) !== null && _a !== void 0 ? _a : []];
            });
        });
    };
    LowDriver.prototype.find = function (name, id) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                this.db.read();
                (_b = this.db).data || (_b.data = {
                    requests: [],
                    exceptions: [],
                    dumps: [],
                    logs: [],
                    "client-requests": []
                });
                return [2 /*return*/, (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.find(function (entry) { return entry.id === id; })];
            });
        });
    };
    LowDriver.prototype.batch = function (batchId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var batch;
            var _this = this;
            return __generator(this, function (_b) {
                this.db.read();
                (_a = this.db).data || (_a.data = {
                    requests: [],
                    exceptions: [],
                    dumps: [],
                    logs: [],
                    "client-requests": []
                });
                batch = [];
                Object.keys(this.db.data).forEach(function (key) {
                    // @ts-ignore
                    batch.push(_this.db.data[key]);
                });
                return [2 /*return*/, batch.flat().filter(function (entry) { return entry.batchId === batchId; })];
            });
        });
    };
    LowDriver.prototype.save = function (name, data) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                this.db.read();
                (_b = this.db).data || (_b.data = {
                    requests: [],
                    exceptions: [],
                    dumps: [],
                    logs: [],
                    "client-requests": []
                });
                (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.unshift(data);
                this.db.write();
                return [2 /*return*/];
            });
        });
    };
    LowDriver.prototype.update = function (name, index, toUpdate) {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                this.db.read();
                (_b = this.db).data || (_b.data = {
                    requests: [],
                    exceptions: [],
                    dumps: [],
                    logs: [],
                    "client-requests": []
                });
                this.db.data[name].splice(index, 1);
                (_a = this.db.data[name]) === null || _a === void 0 ? void 0 : _a.unshift(toUpdate);
                this.db.write();
                return [2 /*return*/];
            });
        });
    };
    LowDriver.prototype.truncate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dir;
            return __generator(this, function (_a) {
                dir = process.cwd() + '/db.json';
                (0, fs_1.unlinkSync)(dir);
                return [2 /*return*/];
            });
        });
    };
    return LowDriver;
}());
exports["default"] = LowDriver;
