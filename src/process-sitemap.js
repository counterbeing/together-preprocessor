import fs from "fs-extra"
import { createSitemap } from "sitemap"

export default async function() {
  console.log("Writing sitemap.")
  const stories = fs.readJsonSync("./storiesIndex.json")
  console.log(stories)
  const urls = stories.map(story => {
    return { url: "/" + story.id + "/", changefreq: "monthly", priority: 0.7 }
  })
  urls.push({ url: "/", changefreq: "monthly", priority: 0.7 })
  var sitemap = createSitemap({
    hostname: "https://together.corylogan.com/",
    cacheTime: 600000,
    urls
  })
  fs.writeFileSync("../together/public/seo/sitemap.xml", sitemap.toString())
}
