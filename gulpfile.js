const { series, src, dest } = require('gulp');
const flatMap = require('flat-map').default
const scaleImages = require('gulp-scale-images')
const imagemin = require('gulp-imagemin');
const dms2dec =  require('dms2dec')
const ExifImage = require('exif').ExifImage;
const globby = require('globby');
const clean = require('gulp-clean');
const fs = require('fs-extra')
const {isWithinInterval, compareDesc, subSeconds} = require('date-fns')
const moment = require('moment')
const yamlFront = require('yaml-front-matter');
const path = require('path')
const showdown = require('showdown')
const { kebabCase, every } = require('lodash')
const { geocoder } = require('./build/geocoder.js')
const sm = require('sitemap')


const dateFormat = 'YYYY:MM:DD HH:mm:ss'

const twoVariantsPerFile = (file, cb) => {
    const small = file.clone()
    small.scale = {maxWidth: 700, format: 'jpg'}
    const medium = file.clone()
    medium.scale = {maxWidth: 1200, format: 'jpg'}
    cb(null, [small, medium])
}

const getImageDataFromImage = (image) => {
  return new Promise((resolve) => {
      new ExifImage({ image }, function (error, exifData) {
          let dec
          if(exifData.gps.GPSLatitude) {

          dec = dms2dec(
            exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef,
            exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef,
          );
        } else {
          dec = [null, null]
        }

        const description = exifData.image.ImageDescription;

        resolve({
          file: path.basename(image),
          date: moment(exifData.exif.DateTimeOriginal, dateFormat).toDate(),
          description,
          lat: dec[0],
          lng: dec[1],
          width: exifData.exif.ExifImageWidth,
          height: exifData.exif.ExifImageHeight,
        })
      });
  })
}

const getImageData = async () => {
  const paths = await globby(['photos/originals/*.{jpg,JPG}']);
  const promises = paths.map((p) => {
    return getImageDataFromImage(p)
  })

  let results = await Promise.all(promises)
  results = results.sort((t1, t2) => {
    return compareDesc(t2.date, t1.date)
  })
  await fs.writeFile('./src/components/photos.json', JSON.stringify(results), () => {})
}

// Conversion of HEIC
// 'for file in *.HEIC; do convert $file -profile 'prof.icc' "`basename $file |  cut -f 1 -d '.'`.jpg"; done'

function cleanup(cb) {
  src('photos/optimized', {read: false})
    .pipe(clean());
  cb()
}

function scale(cb) {
  src('photos/originals/*.{jpeg,jpg,png,gif,JPG,JPEG}')
  .pipe(flatMap(twoVariantsPerFile))
  .pipe(scaleImages())
  .pipe(dest('./photos/optimized/'))
  cb();
}

function optimize(cb) {
  src('photos/originals/*')
    .pipe(imagemin())
    .pipe(dest('photos/optimized'))
  cb()
}

const processMarkdown = (md) => {
  converter = new showdown.Converter(),
  html = converter.makeHtml(md);
  return html
}


const parseStoryFile = async (file) => {
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

async function renderStories() {
  const paths = await globby(['public/stories/*.md']);
  let stories = paths.map((path) => parseStoryFile(path))
  const allPhotos =  JSON.parse(fs.readFileSync('./src/components/photos.json')).map((p) => {
    p.date = new Date(p.date)
    return p
  })
  stories = await Promise.all(stories)
  stories = stories.sort((t1, t2) => compareDesc(t2.startDate, t1.startDate))
  stories = stories.map(async (e, i) => {
    const photos = allPhotos.filter((p) => isWithinInterval(p.date, { start: e.startDate, end: e.endDate}))
    const photosWithLocation = photos.filter((p) => p.lat)
    const lat = photosWithLocation.reduce((a, e) => a + e.lat, 0) / photosWithLocation.length
    const lng = photosWithLocation.reduce((a, e) => a + e.lng, 0) / photosWithLocation.length
    const id = kebabCase(e.title + moment(e.startDate).format('YYYY-MM-DD'))
    const place = await geocoder(e.location)

    const latLng = place.results[0].location
    return {id, ...e, ...latLng, photos}
  })
  stories = await Promise.all(stories)

  // links for previous and next ids
  stories = stories.map((e, i) => {
    let next = stories[i + 1]
    next = next ? next : {}
    let previous = stories[i - 1]
    previous = previous ? previous : {}
    return { ...e, previousId: previous.id, nextId: next.id }
  })

  stories = stories.map((story, i) => {
    const overlaps = stories.filter(s => {
      return isWithinInterval(s.startDate, {start: story.startDate, end: story.endDate}) &&
        s.id !== story.id
    })
    const photos = story.photos.filter((photo) => {
      return every(overlaps, (overlap) => {
        return !isWithinInterval(photo.date, { start: overlap.startDate, end: overlap.endDate})
      })
    })
    return { ...story, photos }
  })

  await fs.writeFile('./src/components/stories.json', JSON.stringify(stories), () => {})
}

async function sitemap() {
    const stories = fs.readJsonSync('./src/components/stories.json')
    const urls = stories.map((story) => {
      return { url: '/' + story.id + '/', changefreq: 'monthly', priority: 0.7}
    })
    urls.push({ url: '/', changefreq: 'monthly', priority: 0.7})
    var sitemap = sm.createSitemap({
      hostname: 'https://together.corylogan.com/',
      cacheTime: 600000,  //600 sec (10 min) cache purge period
      urls
    });
    fs.writeFileSync("public/seo/sitemap.xml", sitemap.toString());
}

exports.exif = getImageData;
exports.stories = renderStories;
exports.sitemap = sitemap;
exports.default = series(cleanup, scale, optimize, getImageData, renderStories);
