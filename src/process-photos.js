import getMediaMetadata from "./get-media-metadata.js"
import fs from "fs-extra"
import globby from "globby"
import Promise from "bluebird"
import sharp from "sharp"
import { basename, extname } from "path"
import { uploadWebp } from "./uploader.js"
import * as utils from "./utils.js"

let photoIndex = fs.readJsonSync("./index.json")

function generateOutputFiles(sizes, filename, format) {
  return sizes.map(size => {
    return {
      width: size,
      filename: `${filename}-w${size}.${format}`
    }
  })
}

export default async function() {
  const paths = await globby(["photos/*.{jpg,JPG}"])

  const job = Promise.map(
    paths,
    async function(p) {
      process.stdout.write("-")
      const buffer = await fs.readFile(p)
      const meta = await getMediaMetadata(p, buffer)

      if (utils.checkForExactCopy(photoIndex, meta)) {
        process.stdout.write(`S`)
        fs.unlink(p)
        return
      } else {
        utils.replaceOrAddPhoto(photoIndex, meta)
      }

      const processedPhotoPromises = generateOutputFiles(
        [2100, 1600, 1200, 700, 250],
        meta.file,
        "webp"
      )
        .map(obj => {
          process.stdout.write("P")
          return {
            filename: basename(obj.filename),
            buffer: sharp(buffer)
              .resize({ width: obj.width })
              .webp({ quality: 85, reductionEffort: 6 })
              .toBuffer()
          }
        })
        .concat([
          {
            filename: `${meta.file}-wFull.webp`,
            buffer: sharp(buffer)
              .webp({ quality: 85, reductionEffort: 6 })
              .toBuffer()
          }
        ])
        .map(p => {
          return uploadWebp(p.buffer, p.filename)
        })
      let processedPhotos = await Promise.all(processedPhotoPromises).then(
        () => {
          fs.unlink(p)
        }
      )
      return meta
    },
    { concurrency: 10 }
  )

  let j = await job.filter(Boolean)
  await fs.writeFile(
    "./index.json",
    JSON.stringify(photoIndex, null, 4),
    () => {}
  )
}
