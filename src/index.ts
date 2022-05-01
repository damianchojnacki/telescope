import DatabaseDriver, {WatcherData} from './api/drivers/DatabaseDriver.js'
import JSONFileSyncAdapter from './api/drivers/JSONFileSyncAdapter.js'
import LowDriver from './api/drivers/LowDriver.js'
import MemoryDriver from './api/drivers/MemoryDriver.js'

import RequestWatcher, {RequestWatcherData, RequestWatcherEntry} from './api/watchers/RequestWatcher.js'
import ClientRequestWatcher, {ClientRequestWatcherData, ClientRequestWatcherEntry} from './api/watchers/ClientRequestWatcher.js'
import ErrorWatcher, {ErrorWatcherData, ErrorWatcherEntry} from './api/watchers/ErrorWatcher.js'
import DumpWatcher, {DumpWatcherData, DumpWatcherEntry} from './api/watchers/DumpWatcher.js'
import LogWatcher, {LogWatcherData, LogWatcherEntry} from './api/watchers/LogWatcher.js'

import DB, {Driver} from './api/DB.js'
import Telescope, {TelescopeOptions, Watcher} from './api/Telescope.js'
import WatcherEntry, {WatcherEntryCollectionType, WatcherEntryDataType, WatcherType} from './api/WatcherEntry.js'

export default Telescope

export {
    DatabaseDriver,
    WatcherData,
    JSONFileSyncAdapter,
    LowDriver,
    MemoryDriver,
    RequestWatcher,
    RequestWatcherEntry,
    RequestWatcherData,
    ClientRequestWatcher,
    ClientRequestWatcherEntry,
    ClientRequestWatcherData,
    ErrorWatcher,
    ErrorWatcherEntry,
    ErrorWatcherData,
    DumpWatcher,
    DumpWatcherEntry,
    DumpWatcherData,
    LogWatcher,
    LogWatcherEntry,
    LogWatcherData,
    DB,
    Driver,
    TelescopeOptions,
    Watcher,
    WatcherEntry,
    WatcherEntryDataType,
    WatcherEntryCollectionType,
    WatcherType
}