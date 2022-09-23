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
var axios_1 = require("axios");
var promise_1 = require("mysql2/promise");
require("dotenv/config");
var kysely_1 = require("kysely");
var interval;
var db;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        db = new kysely_1.Kysely({
            dialect: new kysely_1.MysqlDialect({
                pool: (0, promise_1.createPool)({ uri: process.env.DATABASE_URL })
            })
        });
        interval = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
            var row, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, getRow()];
                    case 1:
                        row = _a.sent();
                        return [4 /*yield*/, insertRow(row)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 1000);
        return [2 /*return*/];
    });
}); })();
process.on('exit', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.destroy()];
            case 1:
                _a.sent();
                clearInterval(interval);
                return [2 /*return*/];
        }
    });
}); });
function getRow() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var response, scriptTag, firstScriptTag, startIndex, endIndex, data, record;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, axios_1["default"].get((_a = process.env.STATUS_URL) !== null && _a !== void 0 ? _a : '', {
                        auth: {
                            username: (_b = process.env.AUTH_USER) !== null && _b !== void 0 ? _b : '',
                            password: (_c = process.env.AUTH_PASSWORD) !== null && _c !== void 0 ? _c : ''
                        }
                    })];
                case 1:
                    response = _d.sent();
                    scriptTag = '<script type="text/javascript">';
                    firstScriptTag = response.data.indexOf('<script type="text/javascript">');
                    startIndex = response.data.indexOf('<script type="text/javascript">', firstScriptTag + 1) + scriptTag.length;
                    endIndex = response.data.indexOf('function initPageText()', startIndex);
                    data = response.data
                        .slice(startIndex, endIndex)
                        .split('\n')
                        .map(function (item) { return item.split('='); })
                        .map(function (item) { return item.map(function (i) { return i.replace('var', '').replace(/\"/g, '').replace(';', '').trim(); }); });
                    record = Object.fromEntries(data);
                    return [2 /*return*/, {
                            power_now: Number(record.webdata_now_p),
                            energy_today: Number(record.webdata_today_e),
                            energy_total: Number(record.webdata_total_e),
                            alarm: record.webdata_alarm,
                            utime: Number(record.webdata_utime),
                            cover_sta_rssi: record.cover_sta_rssi,
                            timestamp: new Date()
                        }];
            }
        });
    });
}
function insertRow(row) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db.insertInto('logs').values(row).execute()];
        });
    });
}
