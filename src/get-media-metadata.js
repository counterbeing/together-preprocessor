import sexagesimal from "@mapbox/sexagesimal"
import md5 from "md5"
import fs from "fs-extra"
import { basename, extname } from "path"
import exiftool from "node-exiftool"
import exiftoolBin from "dist-exiftool"
import moment from "moment"
import getUuid from "uuid-by-string"

const ep = new exiftool.ExiftoolProcess(exiftoolBin)
let epIsOpen = false

async function getData(file) {
  if (epIsOpen == false) {
    await ep.open()
    epIsOpen = true
  }

  const metadata = await ep.readMetadata(file)
  // ep.close()
  return metadata
}

function mapExtensionToContentType(file) {
  let dext = extname(file).toLowerCase()
  return {
    ".jpg": "image/webp",
    ".m4v": "video/x-m4v"
  }[dext]
}

export default async function(filename, buffer = null) {
  if (!buffer) {
    buffer = await fs.readFile(filename)
  }
  let checksum = md5(buffer)
  let data = await getData(filename)
  data = data["data"][0]

  let lat, lng
  if (data.GPSLatitude && data.GPSLongitude) {
    lat = sexagesimal(data.GPSLatitude)
    lng = sexagesimal(data.GPSLongitude)
  }
  let date = data.ContentCreateDate || data.CreateDate
  date = moment(date, "YYYY:MM:DD HH:mm:ssZ").toISOString()

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
    checksum
  }
}
