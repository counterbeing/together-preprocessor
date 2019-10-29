import sexagesimal from '@mapbox/sexagesimal';
import md5 from 'md5';
import fs from 'fs-extra';
import { extname } from 'path';
import exiftool from 'node-exiftool';
import exiftoolBin from 'dist-exiftool';
import moment from 'moment';
import getUuid from 'uuid-by-string';

const ep = new exiftool.ExiftoolProcess(exiftoolBin);
let epIsOpen = false;

async function getData(file: string) {
  if (epIsOpen == false) {
    await ep.open();
    epIsOpen = true;
  }

  const metadata = await ep.readMetadata(file);
  // ep.close()
  return metadata;
}

function mapExtensionToContentType(file: string) {
  let dext = extname(file).toLowerCase();
  return {
    '.jpg': 'image/jpeg',
    '.m4v': 'video/x-m4v',
  }[dext];
}

export default async function(filename: string, buffer: any = null) {
  if (!buffer) buffer = await fs.readFile(filename);
  if (!buffer) throw 'No buffer provided.';

  let checksum = md5(buffer);
  let data = await getData(filename);
  data = data['data'][0];

  let lat: number | null = null;
  let lng: number | null = null;

  if (data.GPSLatitude && data.GPSLongitude) {
    lat = sexagesimal(data.GPSLatitude);
    lng = sexagesimal(data.GPSLongitude);
  }
  let date = data.ContentCreateDate || data.CreateDate;
  date = moment(date, 'YYYY:MM:DD HH:mm:ssZ').toISOString();

  return {
    file: getUuid(data.FileName + date),
    date,
    description: data.Description || data.ImageDescription,
    contentType: mapExtensionToContentType(data.FileName),
    originalFileName: data.FileName,
    lat,
    lng,
    width: data.ImageWidth,
    height: data.ImageHeight,
    checksum,
  };
}
