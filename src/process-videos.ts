import getMediaMetadata from "./get-media-metadata"
import * as globby from "globby"
import * as fs from "fs-extra"
import { basename } from "path"
import { uploadM4v } from "./uploader"
import { checkForExactCopy, replaceOrAddPhoto } from "./utils"

let photoIndex = fs.readJsonSync("./index.json")

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
