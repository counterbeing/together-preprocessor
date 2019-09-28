export default async function() {
  const stories = fs.readJsonSync("./stories.json")
  const urls = stories.map(story => {
    return { url: "/" + story.id + "/", changefreq: "monthly", priority: 0.7 }
  })
  urls.push({ url: "/", changefreq: "monthly", priority: 0.7 })
  var sitemap = sm.createSitemap({
    hostname: "https://together.corylogan.com/",
    cacheTime: 600000, //600 sec (10 min) cache purge period
    urls
  })
  fs.writeFileSync("public/seo/sitemap.xml", sitemap.toString())
}
