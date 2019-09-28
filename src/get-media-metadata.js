import sexagesimal from "@mapbox/sexagesimal"
import md5 from "md5"
import fs from "fs-extra"
import { basename } from "path"
import exiftool from "node-exiftool"
import exiftoolBin from "dist-exiftool"
import moment from "moment"
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
    file: basename(filename),
    date,
    description: data.Description || data.ImageDescription,
    lat,
    lng,
    width: data.ImageWidth,
    height: data.ImageHeight,
    checksum
  }
}
