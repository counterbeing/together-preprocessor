import getMediaMetadata from "./get-media-metadata.js"
import fs from "fs-extra"
import globby from "globby"
import Promise from "bluebird"
import sharp from "sharp"
import { basename, extname } from "path"
import { uploadWebp } from "./uploader.js"

let photoIndex = fs.readJsonSync("./index.json")

function generateOutputFiles(sizes, filename, format) {
  const base = basename(filename, extname(filename))
  return sizes.map(size => {
    return {
      width: size,
      filename: `${base}-w${size}.${format}`
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
      const alreadyExists = photoIndex.some(photoFromIndex => {
        return (
          photoFromIndex.checksum == meta.checksum &&
          photoFromIndex.date == meta.date.toISOString()
        )
      })

      if (alreadyExists) {
        process.stdout.write(`S`)
        fs.unlink(p)
        return
      } else {
        const i = photoIndex.findIndex(obj => {
          return obj.file == meta.file && obj.date == meta.date.toISOString()
        })
        if (i == -1) {
          photoIndex.push(meta)
        } else {
          photoIndex[i] = meta
        }
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
            filename: `${basename(meta.file, extname(meta.file))}-wFull.webp`,
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
