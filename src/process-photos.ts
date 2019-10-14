import getMediaMetadata from "./get-media-metadata.js"
import * as fs from "fs-extra"
import * as globby from "globby"
import * as BlueBird from "bluebird"
import * as sharp from "sharp"
import { basename } from "path"
import { uploadJpeg } from "./uploader.js"
import { checkForExactCopy, replaceOrAddPhoto } from "./utils"

let photoIndex = fs.readJsonSync("./index.json")

function generateOutputFiles(
  sizes: number[],
  filename: string,
  format: string
) {
  return sizes.map(size => {
    return {
      width: size,
      filename: `${filename}-w${size}.${format}`
    }
  })
}

export default async function() {
  const paths = await globby(["photos/*.{jpg,JPG}"])

  const job = BlueBird.map(
    paths,
    async function(p) {
      process.stdout.write("-")
      const buffer = await fs.readFile(p)
      const meta = await getMediaMetadata(p, buffer)

      if (checkForExactCopy(photoIndex, meta)) {
        process.stdout.write(`S`)
        fs.unlink(p)
        return
      } else {
        replaceOrAddPhoto(photoIndex, meta)
      }

      const processedPhotoPromises = generateOutputFiles(
        [2100, 1600, 1200, 700, 250],
        meta.file,
        "jpeg"
      )
        .map(obj => {
          process.stdout.write("P")
          return {
            filename: basename(obj.filename),
            buffer: sharp(buffer)
              .resize(obj.width)
              .jpeg({ quality: 85 } as sharp.JpegOptions)
              .toBuffer()
          }
        })
        .concat([
          {
            filename: `${meta.file}-wFull.jpeg`,
            buffer: sharp(buffer)
              .jpeg({ quality: 85 } as sharp.JpegOptions)
              .toBuffer()
          }
        ])
        .map(p => {
          return uploadJpeg(p.buffer, p.filename)
        })
      await BlueBird.all(processedPhotoPromises).then(() => {
        fs.unlink(p)
      })
      return meta
    },
    { concurrency: 10 }
  )

  await job.filter(Boolean)
  fs.writeFileSync("./index.json", JSON.stringify(photoIndex, null, 4))
}
