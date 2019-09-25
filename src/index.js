import getPhotoMetadata from './getPhotoMetadata.js'


const file = "photos/originals/IMG_0262.jpg";
getPhotoMetadata(file).then((r) => {
  console.log(r)
})
