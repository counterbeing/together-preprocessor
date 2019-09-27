import sexagesimal from "@mapbox/sexagesimal"
import md5 from "md5"
import fs from "fs-extra"
import { basename } from "path"
import exiftool from "node-exiftool"
import exiftoolBin from "dist-exiftool"
const ep = new exiftool.ExiftoolProcess(exiftoolBin)

async function getData(file) {
  await ep.open()
  const metadata = await ep.readMetadata(file)
  ep.close()
  return metadata
}

export default async function(filename, buffer = null) {
  if (!buffer) {
    buffer = await fs.readFile(filename)
  }
  let checksum = md5(buffer)
  let data = await getData(filename)
  data = data["data"][0]
  // console.log(data)

  let lat, lng
  if (data.GPSLatitude && data.GPSLongitude) {
    lat = sexagesimal(data.GPSLatitude)
    lng = sexagesimal(data.GPSLongitude)
  }
  const out = {
    file: basename(filename),
    date: data.ContentCreateDate || data.CreateDate,
    description: data.Description || data.ImageDescription,
    lat,
    lng,
    width: data.ImageWidth,
    height: data.ImageHeight,
    checksum
  }
  return out
}
