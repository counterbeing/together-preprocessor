import * as globby from "globby"
import { isWithinInterval, compareDesc } from "date-fns"
import * as showdown from "showdown"
import * as fs from "fs-extra"
import { kebabCase, every } from "lodash"
import * as moment from "moment"
import { geocoder } from "./geocoder.js"
import { uploadJSON } from "./uploader"
import { Story } from "./types"
const yamlFront = require("yaml-front-matter")

const parseStoryFile = async (file: string) => {
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

const processMarkdown = (md: string) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(md)
}

export default async function() {
  const paths = await globby(["stories/*.md"])
  let stories: any = paths.map(path => parseStoryFile(path))
  let storiesJsonString: string = fs.readFileSync("index.json").toString()
  const allPhotos = JSON.parse(storiesJsonString).map((p: any) => {
    p.date = new Date(p.date)
    return p
  })
  stories = await Promise.all(stories)
  stories = stories.sort((s1: Story, s2: Story) =>
    compareDesc(s2.startDate, s1.startDate)
  )
  stories = stories.map(async (e: Story) => {
    const photos = allPhotos.filter((p: any) =>
      isWithinInterval(p.date, { start: e.startDate, end: e.endDate })
    )
    const id = kebabCase(e.title + moment(e.startDate).format("YYYY-MM-DD"))
    const place = await geocoder(e.location)

    const latLng = place.results[0].location
    return { id, ...e, ...latLng, photos }
  })
  stories = await Promise.all(stories)

  // Build links for previous and next ids
  stories = stories.map((e: Story, i: number) => {
    let next = stories[i + 1]
    next = next ? next : {}
    let previous = stories[i - 1]
    previous = previous ? previous : {}
    return { ...e, previousId: previous.id, nextId: next.id }
  })

  // Stories can be nested within bigger stories, for example, we might be
  // staying somehwere, but go on a day trip. If the day trip itself warrants a
  // story, those photos should not be included in the longer stay.
  stories = stories.map((story: Story) => {
    const overlaps = stories.filter((s: Story) => {
      return (
        isWithinInterval(s.startDate, {
          start: story.startDate,
          end: story.endDate
        }) && s.id !== story.id
      )
    })
    const photos = story.photos
      .filter(photo => {
        return every(overlaps, (overlap: Story) => {
          return !isWithinInterval(photo.date, {
            start: overlap.startDate,
            end: overlap.endDate
          })
        })
      })
      .sort((b, a) => {
        return +new Date(b.date) - +new Date(a.date)
      })
    return { ...story, photos }
  })

  const overviewIndex = stories.map((s: Story) => {
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
  const storiesIndex = JSON.stringify(overviewIndex)
  uploadJSON(storiesIndex, "storiesIndex.json")
  fs.writeJsonSync("storiesIndex.json", overviewIndex)
  uploadJSON(JSON.stringify(allPhotos), "photosIndex.json")
}
