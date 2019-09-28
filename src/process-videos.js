import getMediaMetadata from "./get-media-metadata.js"
import globby from "globby"
import { basename, extname } from "path"
import { uploadM4v } from "./uploader.js"
import fs from "fs-extra"

let photoIndex = fs.readJsonSync("./index.json")

function checkForExactCopy(index, meta) {
  return index.some(photoFromIndex => {
    return (
      photoFromIndex.checksum == meta.checksum &&
      photoFromIndex.date == meta.date.toISOString()
    )
  })
}

function replaceOrAddPhoto(index, photo) {
  const i = index.findIndex(obj => {
    return obj.file == photo.file && obj.date == photo.date.toISOString()
  })
  if (i == -1) {
    photoIndex.push(photo)
  } else {
    photoIndex[i] = photo
  }
}

export default (async function(folder) {
  const paths = await globby([`${folder}/*.{m4v,M4V}`])
  const videoUploadPromises = await paths.map(async p => {
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

  let uploadedVideos = await Promise.all(videoUploadPromises)
  await uploadedVideos
  await fs.writeFile(
    "./index.json",
    JSON.stringify(photoIndex, null, 4),
    () => {}
  )
})("photos")
