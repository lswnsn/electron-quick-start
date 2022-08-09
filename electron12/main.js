/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/vcu-offline/src/app/app.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./apps/vcu-offline/src/environments/environment.ts");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("child_process");
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_3__);




const os = __webpack_require__("os");
const fs = __webpack_require__("fs");
let forkedProcess;
class App {
    static isDevelopmentMode() {
        const isEnvironmentSet = 'ELECTRON_IS_DEV' in process.env;
        // @ts-ignore
        const getFromEnvironment = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
        return isEnvironmentSet ? getFromEnvironment : !_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.production;
    }
    static onWindowAllClosed() {
        console.log(`!!on onWindowAllClosed!!!`);
        App.application.quit();
    }
    static onClose() {
        // @ts-ignore
        App.mainWindow = null;
    }
    static onRedirect(event, url) {
        if (url !== App.mainWindow.webContents.getURL()) {
            event.preventDefault();
            electron__WEBPACK_IMPORTED_MODULE_0__.shell.openExternal(url);
        }
    }
    static onReady() {
        App.initMainWindow();
        App.loadMainWindow();
    }
    static onActivate() {
        if (App.mainWindow === null) {
            App.onReady();
        }
    }
    static initMainWindow() {
        const workAreaSize = electron__WEBPACK_IMPORTED_MODULE_0__.screen.getPrimaryDisplay().workAreaSize;
        const iconPath = process.platform === 'linux' ?
            path__WEBPACK_IMPORTED_MODULE_2___default().join(__dirname, 'assets/static', '256x256.png') : path__WEBPACK_IMPORTED_MODULE_2___default().join(__dirname, 'assets/static', 'favicon.ico');
        // Create the browser window.
        App.mainWindow = new electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow({
            width: workAreaSize.width,
            height: workAreaSize.height,
            show: false,
            icon: iconPath,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false
            },
        });
        App.mainWindow.setMenu(null);
        App.mainWindow.center();
        App.mainWindow.once('ready-to-show', () => {
            App.mainWindow.show();
        });
        App.mainWindow.on('closed', () => {
            // @ts-ignore
            App.mainWindow = null;
        });
    }
    static loadMainWindow() {
        const indexPath = path__WEBPACK_IMPORTED_MODULE_2___default().resolve(__dirname, `assets/index.js`);
        console.log(`index path is ${indexPath}`);
        forkedProcess = (0,child_process__WEBPACK_IMPORTED_MODULE_3__.fork)(indexPath, ['--static', 'static']);
        forkedProcess.on('message', (message) => {
            console.log(`Received message from forked process "${message}"`);
            if (message.startsWith('SERVER_UP')) {
                const data = message.split('_');
                const portNumber = data[data.length - 1];
                const directoryPath = `${os.homedir()}/vcu-offline-data`;
                const saveWnlsDataHandler = (event, wnlsContent) => {
                    // eslint-disable-next-line no-bitwise
                    fs.access(directoryPath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
                        try {
                            if (err && err.code === 'ENOENT') {
                                fs.mkdirSync(directoryPath);
                                fs.chmodSync(directoryPath, 0o770);
                            }
                            else if (err && err.code === 'EPERM') {
                                fs.chmodSync(directoryPath, 0o770);
                            }
                            fs.writeFileSync(`${directoryPath}/ui_settings.wnls`, wnlsContent);
                            console.log(`Write ${directoryPath}/ui_settings.wnls success!`);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    });
                };
                App.mainWindow.loadURL(`http://localhost:${portNumber}/sso-offline-login?token="123"`).then(() => {
                    electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('save-wnls-data', saveWnlsDataHandler);
                });
                App.mainWindow.webContents.on('will-prevent-unload', () => {
                    console.log('App.mainWindow.webContents will-prevent-unload');
                    forkedProcess.send('UI_QUIT');
                    App.application.quit();
                    process.exit(0);
                });
                App.mainWindow.webContents.on('did-finish-load', () => {
                    fs.access(directoryPath, fs.constants.R_OK, (err) => {
                        try {
                            if (err && err.code === 'EPERM')
                                fs.chmodSync(directoryPath, 0o400);
                            const data = fs.readFileSync(`${directoryPath}/ui_settings.wnls`);
                            App.mainWindow.webContents.send('load-wnls-data', data.toString());
                            console.log(`Load ${directoryPath}/ui_settings.wnls success!`);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    });
                });
                App.mainWindow.on('close', () => {
                    electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.removeHandler('save-wnls-data');
                    electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('save-wnls-data', saveWnlsDataHandler);
                    forkedProcess.send('UI_QUIT');
                });
            }
            else if (message.endsWith('.zip')) {
                App.mainWindow.setTitle(`${App.mainWindow.getTitle().split('  /')[0]}  /  ${message}`);
            }
        });
        console.log(`fork done`);
    }
    static main(app, browserWindow) {
        App.BrowserWindow = browserWindow;
        App.application = app;
        App.application.on('window-all-closed', App.onWindowAllClosed);
        App.application.on('ready', App.onReady);
        App.application.on('activate', App.onActivate);
    }
}


/***/ }),

/***/ "./apps/vcu-offline/src/app/events/electron.events.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ElectronEvents)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./apps/vcu-offline/src/environments/environment.ts");
/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */


class ElectronEvents {
    static bootstrapElectronEvents() {
        return electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain;
    }
}
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('get-app-version', (event) => {
    console.log(`Fetching application version... [v${_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.version}]`);
    return _environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.version;
});
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.on('quit', (event, code) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.app.exit(code);
});


/***/ }),

/***/ "./apps/vcu-offline/src/app/events/squirrel.events.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SquirrelEvents)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("child_process");
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./apps/vcu-offline/src/environments/environment.ts");
/**
 * This module is responsible on handling all the setup events that is submitted by squirrel.
 */




class SquirrelEvents {
    static handleEvents() {
        if (process.argv.length === 1 || process.platform !== 'win32') {
            return false;
        }
        switch (process.argv[1]) {
            case '--squirrel-install':
            case '--squirrel-updated':
                SquirrelEvents.update(['--createShortcut', SquirrelEvents.exeName]);
                return true;
            case '--squirrel-uninstall':
                SquirrelEvents.update(['--removeShortcut', SquirrelEvents.exeName]);
                return true;
            case '--squirrel-obsolete':
                electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
                return true;
            case '--squirrel-firstrun':
                SquirrelEvents.isAppFirstRun = true;
                return false;
        }
        return false;
    }
    static isFirstRun() {
        return SquirrelEvents.isAppFirstRun;
    }
    static update(args) {
        try {
            (0,child_process__WEBPACK_IMPORTED_MODULE_1__.spawn)(SquirrelEvents.updateExe, args, { detached: true }).on('close', () => setTimeout(electron__WEBPACK_IMPORTED_MODULE_0__.app.quit, 1000));
        }
        catch (error) {
            setTimeout(electron__WEBPACK_IMPORTED_MODULE_0__.app.quit, 1000);
        }
    }
}
SquirrelEvents.isAppFirstRun = false;
SquirrelEvents.appFolder = (0,path__WEBPACK_IMPORTED_MODULE_2__.resolve)(process.execPath, '..');
SquirrelEvents.appRootFolder = (0,path__WEBPACK_IMPORTED_MODULE_2__.resolve)(SquirrelEvents.appFolder, '..');
SquirrelEvents.updateExe = (0,path__WEBPACK_IMPORTED_MODULE_2__.resolve)((0,path__WEBPACK_IMPORTED_MODULE_2__.join)(SquirrelEvents.appRootFolder, 'Update.exe'));
SquirrelEvents.exeName = (0,path__WEBPACK_IMPORTED_MODULE_2__.resolve)((0,path__WEBPACK_IMPORTED_MODULE_2__.join)(SquirrelEvents.appRootFolder, 'app-' + _environments_environment__WEBPACK_IMPORTED_MODULE_3__.environment.version, (0,path__WEBPACK_IMPORTED_MODULE_2__.basename)(process.execPath)));


/***/ }),

/***/ "./apps/vcu-offline/src/environments/environment.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "environment": () => (/* binding */ environment)
/* harmony export */ });
const environment = {
    production: false,
    version: "0.1.0",
};


/***/ }),

/***/ "./libs/offline-backend-shared/src/lib/utils/logger.ts":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ OverridedLogger)
/* harmony export */ });
const logger = __webpack_require__("electron-log");
const os = __webpack_require__("os");
const MEGABIT = 1048576;
class OverridedLogger {
    static overridLog(product, timeString) {
        logger.transports.file.maxSize = MEGABIT * 100;
        logger.transports.file.resolvePath = () => `${os.homedir()}/${product}-offline-data/offline-tool-${formateLogTime(timeString)}.log`;
        console = logger.functions;
    }
}
;
function formateLogTime(timeString) {
    return timeString === null || timeString === void 0 ? void 0 : timeString.split('T')[0];
}


/***/ }),

/***/ "electron":
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "electron-log":
/***/ ((module) => {

module.exports = require("electron-log");

/***/ }),

/***/ "child_process":
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Main)
/* harmony export */ });
/* harmony import */ var _app_events_squirrel_events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./apps/vcu-offline/src/app/events/squirrel.events.ts");
/* harmony import */ var _app_events_electron_events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./apps/vcu-offline/src/app/events/electron.events.ts");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _app_app__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./apps/vcu-offline/src/app/app.ts");
/* harmony import */ var _oam_offline_backend_shared_lib_utils_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./libs/offline-backend-shared/src/lib/utils/logger.ts");





class Main {
    static initialize() {
        // eslint-disable-next-line no-restricted-syntax
        _oam_offline_backend_shared_lib_utils_logger__WEBPACK_IMPORTED_MODULE_4__["default"].overridLog('vcu', new Date().toISOString());
        if (_app_events_squirrel_events__WEBPACK_IMPORTED_MODULE_0__["default"].handleEvents()) {
            electron__WEBPACK_IMPORTED_MODULE_2__.app.quit();
        }
    }
    static bootstrapApp() {
        _app_app__WEBPACK_IMPORTED_MODULE_3__["default"].main(electron__WEBPACK_IMPORTED_MODULE_2__.app, electron__WEBPACK_IMPORTED_MODULE_2__.BrowserWindow);
    }
    static bootstrapAppEvents() {
        _app_events_electron_events__WEBPACK_IMPORTED_MODULE_1__["default"].bootstrapElectronEvents();
        // eslint-disable-next-line no-empty
        if (!_app_app__WEBPACK_IMPORTED_MODULE_3__["default"].isDevelopmentMode()) {
        }
    }
}
Main.initialize();
Main.bootstrapApp();
Main.bootstrapAppEvents();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map