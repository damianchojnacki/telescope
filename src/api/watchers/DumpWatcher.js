"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.dump = exports.DumpWatcherEntry = void 0;
var WatcherEntry_js_1 = require("../WatcherEntry.js");
var DB_js_1 = require("../DB.js");
var DumpWatcherEntry = /** @class */ (function (_super) {
    __extends(DumpWatcherEntry, _super);
    function DumpWatcherEntry(data) {
        return _super.call(this, WatcherEntry_js_1.WatcherEntryDataType.dumps, data) || this;
    }
    return DumpWatcherEntry;
}(WatcherEntry_js_1["default"]));
exports.DumpWatcherEntry = DumpWatcherEntry;
function dump(data) {
    var watcher = new DumpWatcher(data);
    watcher.save();
}
exports.dump = dump;
var DumpWatcher = /** @class */ (function () {
    function DumpWatcher(data) {
        this.data = data;
    }
    DumpWatcher.prototype.save = function () {
        var entry = new DumpWatcherEntry({
            dump: this.data
        });
        DB_js_1["default"].dumps().save(entry);
    };
    DumpWatcher.entryType = WatcherEntry_js_1.WatcherEntryCollectionType.dump;
    return DumpWatcher;
}());
exports["default"] = DumpWatcher;
