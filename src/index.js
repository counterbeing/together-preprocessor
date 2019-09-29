import processPhotos from "./process-photos.js"
import processStories from "./process-stories.js"
import processSitemap from "./process-sitemap.js"
;(async function() {
  await processPhotos()
  await processStories()
  await processSitemap()
})()
