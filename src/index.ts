import processPhotos from './process-photos';
import processStories from './process-stories';
import processSitemap from './process-sitemap';
(async function() {
  await processPhotos();
  await processStories();
  await processSitemap();
})();
