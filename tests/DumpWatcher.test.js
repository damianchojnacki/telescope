var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import Telescope from "../src/api/Telescope.js";
import MemoryDriver from "../src/api/drivers/MemoryDriver.js";
import DB from "../src/api/DB.js";
import { dump } from "../src/api/watchers/DumpWatcher.js";
describe('DumpWatcher', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        DB.driver = MemoryDriver;
        yield DB.truncate();
    }));
    it('saves dumps', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = express();
        Telescope.setup(app);
        dump('Hello world');
        const entry = (yield DB.dumps().get())[0];
        expect(entry).not.toBeUndefined();
        expect(entry.type).toEqual('dump');
    }));
    it('saves string dumps', () => __awaiter(void 0, void 0, void 0, function* () {
        yield assertDump('Hello world');
    }));
    it('saves object dumps', () => __awaiter(void 0, void 0, void 0, function* () {
        yield assertDump({
            foo: "bar"
        });
    }));
    it('saves array dumps', () => __awaiter(void 0, void 0, void 0, function* () {
        yield assertDump([
            'foo',
            'bar'
        ]);
    }));
    it('saves complex dumps', () => __awaiter(void 0, void 0, void 0, function* () {
        yield assertDump([
            {
                "name": "Luke Skywalker",
                "height": "172",
                "films": [
                    "https://swapi.dev/api/films/1/",
                    "https://swapi.dev/api/films/2/",
                    "https://swapi.dev/api/films/3/",
                    "https://swapi.dev/api/films/6/"
                ],
                "species": [
                    {
                        "sci-fi": true
                    }
                ],
            }
        ]);
    }));
    function assertDump(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = express();
            Telescope.setup(app);
            dump(content);
            const entry = (yield DB.dumps().get())[0];
            expect(entry.content.dump).toEqual(content);
        });
    }
});
