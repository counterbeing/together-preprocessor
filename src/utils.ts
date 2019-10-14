import { Media } from "./types"

function checkForExactCopy(index: Media[], meta: any) {
  return index.some(photoFromIndex => {
    return (
      photoFromIndex.checksum == meta.checksum &&
      photoFromIndex.date == meta.date
    )
  })
}

function replaceOrAddPhoto(index: Media[], photo: Media) {
  const i = index.findIndex(obj => {
    return obj.file == photo.file && obj.date == photo.date
  })
  if (i == -1) {
    index.push(photo)
  } else {
    index[i] = photo
  }
}

export { checkForExactCopy, replaceOrAddPhoto }
