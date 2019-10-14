"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var globby = require("globby");
var date_fns_1 = require("date-fns");
var showdown = require("showdown");
var fs = require("fs-extra");
var lodash_1 = require("lodash");
var moment = require("moment");
var geocoder_js_1 = require("./geocoder.js");
var uploader_1 = require("./uploader");
var yamlFront = require("yaml-front-matter");
var parseStoryFile = function (file) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, obj;
    return __generator(this, function (_a) {
        contents = fs.readFileSync(file);
        obj = yamlFront.loadFront(contents);
        return [2 /*return*/, {
                title: obj.title,
                location: obj.location,
                description: obj.description,
                startDate: new Date(obj.start_date),
                endDate: new Date(obj.end_date),
                body: processMarkdown(obj.__content)
            }];
    });
}); };
var processMarkdown = function (md) {
    var converter = new showdown.Converter();
    return converter.makeHtml(md);
};
function default_1() {
    return __awaiter(this, void 0, void 0, function () {
        var paths, stories, storiesJsonString, allPhotos, overviewIndex, storiesIndex;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, globby(["stories/*.md"])];
                case 1:
                    paths = _a.sent();
                    stories = paths.map(function (path) { return parseStoryFile(path); });
                    storiesJsonString = fs.readFileSync("index.json").toString();
                    allPhotos = JSON.parse(storiesJsonString).map(function (p) {
                        p.date = new Date(p.date);
                        return p;
                    });
                    return [4 /*yield*/, Promise.all(stories)];
                case 2:
                    stories = _a.sent();
                    stories = stories.sort(function (s1, s2) {
                        return date_fns_1.compareDesc(s2.startDate, s1.startDate);
                    });
                    stories = stories.map(function (e) { return __awaiter(_this, void 0, void 0, function () {
                        var photos, id, place, latLng;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    photos = allPhotos.filter(function (p) {
                                        return date_fns_1.isWithinInterval(p.date, { start: e.startDate, end: e.endDate });
                                    });
                                    id = lodash_1.kebabCase(e.title + moment(e.startDate).format("YYYY-MM-DD"));
                                    return [4 /*yield*/, geocoder_js_1.geocoder(e.location)];
                                case 1:
                                    place = _a.sent();
                                    latLng = place.results[0].location;
                                    return [2 /*return*/, __assign(__assign(__assign({ id: id }, e), latLng), { photos: photos })];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(stories)
                        // Build links for previous and next ids
                    ];
                case 3:
                    stories = _a.sent();
                    // Build links for previous and next ids
                    stories = stories.map(function (e, i) {
                        var next = stories[i + 1];
                        next = next ? next : {};
                        var previous = stories[i - 1];
                        previous = previous ? previous : {};
                        return __assign(__assign({}, e), { previousId: previous.id, nextId: next.id });
                    });
                    // Stories can be nested within bigger stories, for example, we might be
                    // staying somehwere, but go on a day trip. If the day trip itself warrants a
                    // story, those photos should not be included in the longer stay.
                    stories = stories.map(function (story) {
                        var overlaps = stories.filter(function (s) {
                            return (date_fns_1.isWithinInterval(s.startDate, {
                                start: story.startDate,
                                end: story.endDate
                            }) && s.id !== story.id);
                        });
                        var photos = story.photos
                            .filter(function (photo) {
                            return lodash_1.every(overlaps, function (overlap) {
                                return !date_fns_1.isWithinInterval(photo.date, {
                                    start: overlap.startDate,
                                    end: overlap.endDate
                                });
                            });
                        })
                            .sort(function (b, a) {
                            return +new Date(b.date) - +new Date(a.date);
                        });
                        return __assign(__assign({}, story), { photos: photos });
                    });
                    overviewIndex = stories.map(function (s) {
                        uploader_1.uploadJSON(JSON.stringify(s), s.id + ".json");
                        return {
                            id: s.id,
                            title: s.title,
                            location: s.location,
                            startDate: s.startDate,
                            lat: s.lat,
                            lng: s.lng
                        };
                    });
                    storiesIndex = JSON.stringify(overviewIndex);
                    uploader_1.uploadJSON(storiesIndex, "storiesIndex.json");
                    fs.writeJsonSync("storiesIndex.json", overviewIndex);
                    uploader_1.uploadJSON(JSON.stringify(allPhotos), "photosIndex.json");
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = default_1;
