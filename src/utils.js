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
    index.push(photo)
  } else {
    index[i] = photo
  }
}

export { checkForExactCopy, replaceOrAddPhoto }
