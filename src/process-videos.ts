import getMediaMetadata from "./get-media-metadata"
import * as globby from "globby"
import { basename } from "path"
import { uploadM4v } from "./uploader.js"
import * as fs from "fs-extra"

let photoIndex = fs.readJsonSync("./index.json")

function checkForExactCopy(index, meta) {
  return index.some(photoFromIndex => {
    return (
      photoFromIndex.checksum == meta.checksum &&
      photoFromIndex.date == meta.date
    )
  })
}

function replaceOrAddPhoto(index, photo) {
  const i = index.findIndex(obj => {
    return obj.file == photo.file && obj.date == photo.date
  })
  if (i == -1) {
    photoIndex.push(photo)
  } else {
    photoIndex[i] = photo
  }
}

export default (async function(folder) {
  const paths = await globby([`${folder}/*.{m4v,M4V}`])
  const videoUploadPromises = paths.map(async p => {
    const meta = await getMediaMetadata(p)
    const exactCopyExists = checkForExactCopy(photoIndex, meta)
    if (exactCopyExists) {
      process.stdout.write(`S`)
      fs.unlink(p)
      return
    } else {
      replaceOrAddPhoto(photoIndex, meta)
    }
    const buffer = await fs.readFile(p)
    return uploadM4v(buffer, basename(meta.file)).then(() => {
      fs.unlink(p)
    })
  })

  await Promise.all(videoUploadPromises)
  fs.writeFileSync("./index.json", JSON.stringify(photoIndex, null, 4))
})("photos")
