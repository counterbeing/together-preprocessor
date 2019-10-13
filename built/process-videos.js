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
Object.defineProperty(exports, "__esModule", { value: true });
var get_media_metadata_1 = require("./get-media-metadata");
var globby = require("globby");
var path_1 = require("path");
var uploader_js_1 = require("./uploader.js");
var fs = require("fs-extra");
var photoIndex = fs.readJsonSync("./index.json");
function checkForExactCopy(index, meta) {
    return index.some(function (photoFromIndex) {
        return (photoFromIndex.checksum == meta.checksum &&
            photoFromIndex.date == meta.date);
    });
}
function replaceOrAddPhoto(index, photo) {
    var i = index.findIndex(function (obj) {
        return obj.file == photo.file && obj.date == photo.date;
    });
    if (i == -1) {
        photoIndex.push(photo);
    }
    else {
        photoIndex[i] = photo;
    }
}
exports.default = (function (folder) {
    return __awaiter(this, void 0, void 0, function () {
        var paths, videoUploadPromises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, globby([folder + "/*.{m4v,M4V}"])];
                case 1:
                    paths = _a.sent();
                    videoUploadPromises = paths.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                        var meta, exactCopyExists, buffer;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, get_media_metadata_1.default(p)];
                                case 1:
                                    meta = _a.sent();
                                    exactCopyExists = checkForExactCopy(photoIndex, meta);
                                    if (exactCopyExists) {
                                        process.stdout.write("S");
                                        fs.unlink(p);
                                        return [2 /*return*/];
                                    }
                                    else {
                                        replaceOrAddPhoto(photoIndex, meta);
                                    }
                                    return [4 /*yield*/, fs.readFile(p)];
                                case 2:
                                    buffer = _a.sent();
                                    return [2 /*return*/, uploader_js_1.uploadM4v(buffer, path_1.basename(meta.file)).then(function () {
                                            fs.unlink(p);
                                        })];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(videoUploadPromises)];
                case 2:
                    _a.sent();
                    fs.writeFileSync("./index.json", JSON.stringify(photoIndex, null, 4));
                    return [2 /*return*/];
            }
        });
    });
})("photos");