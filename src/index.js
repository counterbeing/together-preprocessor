import getPhotoMetadata from "./getPhotoMetadata.js"
import fs from "fs-extra"
import globby from "globby"
import Promise from "bluebird"
import sharp from "sharp"
import { basename } from "path"

let photoIndex = fs.readJsonSync("./index.json")

function generateOutputFiles(sizes, filename, format) {
  const base = basename(filename)
  return sizes.map(size => {
    return {
      width: size,
      filename: `tmp/${base}-w${size}.${format}`
    }
  })
}

async function run() {
  const paths = await globby(["photos/originals/*.{jpg,JPG}"])

  Promise.map(
    paths,
    async function(p) {
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
        console.log(`skipping because it exists ${p}`)
        return
      } else {
        photoIndex.push(meta)
      }

      const processedPhotoPromises = generateOutputFiles(
        [1600, 1200, 700, 250],
        meta.file,
        "webp"
      ).map(obj => {
        return sharp(buffer)
          .resize({ width: obj.width })
          .webp({ quality: 85, reductionEffort: 6 })
          .toFile(obj.filename)
      })
      let processedPhotos = await Promise.all(processedPhotoPromises)
    },
    { concurrency: 5 }
  )

  // let results = await Promise.all(promises)
  // await fs.writeFile('./index.json', JSON.stringify(results,  null, 4), () => {})
}

run().then(data => {})

// file: 'IMG_0487.jpg',
// date: 2019-01-24T21:07:18.000Z,
// description: undefined,
// lat: null,
// lng: null,
// width: 3024,
// height: 4032,
// checksum: 'afba73c785a917b74dedbc76fecb03f3'
