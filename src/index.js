import getPhotoMetadata from "./getPhotoMetadata.js"
import fs from "fs-extra"
import globby from "globby"
import Promise from "bluebird"
import sharp from "sharp"
import { basename, extname } from "path"
import upload from "./uploader.js"

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

async function run() {
  const paths = await globby(["photos/*.{jpg,JPG}"])

  const job = Promise.map(
    paths,
    async function(p) {
      process.stdout.write("-")
      const buffer = await fs.readFile(p)
      const meta = await getPhotoMetadata(p, buffer)
      const alreadyExists = photoIndex.some(photoFromIndex => {
        return (
          photoFromIndex.checksum == meta.checksum &&
          photoFromIndex.date == meta.date.toISOString()
        )
      })

      if (alreadyExists) {
        // TODO: update caption and location, or totally replace
        process.stdout.write(`S`)
        fs.unlink(p)
        return
      } else {
        photoIndex.push(meta)
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
          return upload(p.buffer, p.filename)
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

run()

// file: 'IMG_0487.jpg',
// date: 2019-01-24T21:07:18.000Z,
// description: undefined,
// lat: null,
// lng: null,
// width: 3024,
// height: 4032,
// checksum: 'afba73c785a917b74dedbc76fecb03f3'
