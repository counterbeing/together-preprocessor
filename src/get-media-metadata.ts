import * as sexagesimal from "@mapbox/sexagesimal"
import * as md5 from "md5"
import * as fs from "fs-extra"
import { extname } from "path"
import * as exiftool from "node-exiftool"
import * as exiftoolBin from "dist-exiftool"
import * as moment from "moment"
import * as getUuid from "uuid-by-string"

const ep = new exiftool.ExiftoolProcess(exiftoolBin)
let epIsOpen = false

async function getData(file: string) {
  if (epIsOpen == false) {
    await ep.open()
    epIsOpen = true
  }

  const metadata = await ep.readMetadata(file)
  // ep.close()
  return metadata
}

function mapExtensionToContentType(file: string) {
  let dext = extname(file).toLowerCase()
  return {
    ".jpg": "image/webp",
    ".m4v": "video/x-m4v"
  }[dext]
}

export default async function(filename: string, buffer = null) {
  if (!buffer) {
    buffer = await fs.readFile(filename)
  }
  let checksum = md5(buffer)
  let data = await getData(filename)
  data = data["data"][0]

  let lat: number, lng: number
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
