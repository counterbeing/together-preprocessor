import processPhotos from "./process-photos.js"
import processStories from "./process-stories.js"
;(async function() {
  await processPhotos()
  await processStories()
})()
