"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkForExactCopy(index, meta) {
    return index.some(function (photoFromIndex) {
        return (photoFromIndex.checksum == meta.checksum &&
            photoFromIndex.date == meta.date);
    });
}
exports.checkForExactCopy = checkForExactCopy;
function replaceOrAddPhoto(index, photo) {
    var i = index.findIndex(function (obj) {
        return obj.file == photo.file && obj.date == photo.date;
    });
    if (i == -1) {
        index.push(photo);
    }
    else {
        index[i] = photo;
    }
}
exports.replaceOrAddPhoto = replaceOrAddPhoto;
