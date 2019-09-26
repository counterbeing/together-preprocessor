import dms2dec from "dms2dec";
import md5 from "md5";
import moment from "moment";
import path from "path";
import { promises as fs } from "fs";
var ExifImage = require("exif").ExifImage;
const dateFormat = "YYYY:MM:DD HH:mm:ss";

async function getPhotoMetadata(filename, buffer) {
  let promise;
  return new Promise(resolve => {
    let checksum = md5(buffer);
    new ExifImage({ image: buffer }, function(error, exifData) {
      let dec;
      if (exifData.gps.GPSLatitude) {
        dec = dms2dec(
          exifData.gps.GPSLatitude,
          exifData.gps.GPSLatitudeRef,
          exifData.gps.GPSLongitude,
          exifData.gps.GPSLongitudeRef
        );
      } else {
        dec = [null, null];
      }

      const description = exifData.image.ImageDescription;

      resolve({
        file: path.basename(filename),
        date: moment(exifData.exif.DateTimeOriginal, dateFormat).toDate(),
        description,
        lat: dec[0],
        lng: dec[1],
        width: exifData.exif.ExifImageWidth,
        height: exifData.exif.ExifImageHeight,
        checksum
      });
    });
  });
}

export default getPhotoMetadata;
