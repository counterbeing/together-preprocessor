import sexagesimal from '@mapbox/sexagesimal';
import md5 from 'md5';
import { extname, basename } from 'path';
import moment from 'moment';
import getUuid from 'uuid-by-string';
import fs from 'fs';
import exif from 'jpeg-exif';
import dms2dec from 'dms2dec';

function mapExtensionToContentType(file: string) {
  let dext = extname(file).toLowerCase();
  return {
    '.jpg': 'image/jpeg',
    '.m4v': 'video/x-m4v',
  }[dext];
}

export const getMediaMetadata = async (
  filename: string,
  buffer: any = null,
) => {
  if (!buffer) buffer = fs.readFileSync(filename);

  const checksum = md5(buffer);
  const data = exif.fromBuffer(buffer);

  let lat: number | null = null;
  let lng: number | null = null;

  const gps = data.GPSInfo;
  if (gps.GPSLatitude && gps.GPSLongitude) {
    [lat, lng] = dms2dec(
      gps.GPSLatitude,
      gps.GPSLatitudeRef,
      gps.GPSLongitude,
      gps.GPSLongitudeRef,
    );
  }
  let date = data.DateTime;
  date = moment(date, 'YYYY:MM:DD HH:mm:ssZ').toISOString();

  return {
    file: getUuid(basename(filename) + date),
    date,
    description: data.Description || data.ImageDescription,
    contentType: mapExtensionToContentType(filename),
    originalFileName: basename(filename),
    lat,
    lng,
    width: data.SubExif.PixelXDimension,
    height: data.SubExif.PixelYDimension,
    checksum,
  };
};
