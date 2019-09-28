import globby from "globby"
import { isWithinInterval, compareDesc, subSeconds } from "date-fns"
import showdown from "showdown"
import fs from "fs-extra"
import { kebabCase, every } from "lodash"
import moment from "moment"
import { geocoder } from "./geocoder.js"
import { uploadJSON } from "./uploader.js"
const yamlFront = require("yaml-front-matter")

const parseStoryFile = async file => {
  const contents = fs.readFileSync(file)
  const obj = yamlFront.loadFront(contents)
  return {
    title: obj.title,
    location: obj.location,
    description: obj.description,
    startDate: new Date(obj.start_date),
    endDate: new Date(obj.end_date),
    body: processMarkdown(obj.__content)
  }
}

const processMarkdown = md => {
  const converter = new showdown.Converter()
  return converter.makeHtml(md)
}

export default async function() {
  const paths = await globby(["stories/*.md"])
  let stories = paths.map(path => parseStoryFile(path))
  const allPhotos = JSON.parse(fs.readFileSync("index.json")).map(p => {
    p.date = new Date(p.date)
    return p
  })
  stories = await Promise.all(stories)
  stories = stories.sort((t1, t2) => compareDesc(t2.startDate, t1.startDate))
  stories = stories.map(async (e, i) => {
    const photos = allPhotos.filter(p =>
      isWithinInterval(p.date, { start: e.startDate, end: e.endDate })
    )
    const id = kebabCase(e.title + moment(e.startDate).format("YYYY-MM-DD"))
    const place = await geocoder(e.location)

    const latLng = place.results[0].location
    return { id, ...e, ...latLng, photos }
  })
  stories = await Promise.all(stories)

  // Build links for previous and next ids
  stories = stories.map((e, i) => {
    let next = stories[i + 1]
    next = next ? next : {}
    let previous = stories[i - 1]
    previous = previous ? previous : {}
    return { ...e, previousId: previous.id, nextId: next.id }
  })

  // Stories can be nested within bigger stories, for example, we might be
  // staying somehwere, but go on a day trip. If the day trip itself warrants a
  // story, those photos should not be included in the longer stay.
  stories = stories.map((story, i) => {
    const overlaps = stories.filter(s => {
      return (
        isWithinInterval(s.startDate, {
          start: story.startDate,
          end: story.endDate
        }) && s.id !== story.id
      )
    })
    const photos = story.photos
      .filter(photo => {
        return every(overlaps, overlap => {
          return !isWithinInterval(photo.date, {
            start: overlap.startDate,
            end: overlap.endDate
          })
        })
      })
      .sort((b, a) => {
        return new Date(b.date) - new Date(a.date)
      })
    return { ...story, photos }
  })

  const overviewIndex = stories.map(s => {
    uploadJSON(JSON.stringify(s), s.id + ".json")
    return {
      id: s.id,
      title: s.title,
      location: s.location,
      startDate: s.startDate,
      lat: s.lat,
      lng: s.lng
    }
  })
  uploadJSON(JSON.stringify(overviewIndex), "storiesIndex.json")
  uploadJSON(JSON.stringify(allPhotos), "photosIndex.json")
}

async function sitemap() {
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
