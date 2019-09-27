import md5 from "md5"
import fs from "fs-extra"
import { basename } from "path"
import exiftool from "node-exiftool"
import exiftoolBin from "dist-exiftool"
const ep = new exiftool.ExiftoolProcess(exiftoolBin)

async function getData() {
  await ep.open()
  const metadata = await ep.readMetadata("./photos/IMG_0595.m4v")
  ep.close()
  return metadata
}

export default async function(filename, buffer = null) {
  if (!buffer) {
    buffer = await fs.readFile(filename)
  }
  let checksum = md5(buffer)
  let data = await getData()
  data = data["data"][0]
  const out = {
    file: basename(filename),
    date: data.ContentCreateDate,
    description: data.Description,
    checksum
  }
  return out
}
