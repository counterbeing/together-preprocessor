import { getMediaMetadata } from './get-media-metadata';
import globby from 'globby';
import fs from 'fs-extra';
import { basename } from 'path';
import { uploadM4v } from './uploader';

let photoIndex = fs.readJsonSync('./index.json');

export default (async function(folder) {
  const paths = await globby([`${folder}/*.{m4v,M4V}`]);
  const videoUploadPromises = paths.map(async (p) => {
    const meta = await getMediaMetadata(p);
    const buffer = await fs.readFile(p);
    // return uploadM4v(buffer, basename(meta.file)).then(() => {
    //   fs.unlink(p);
    // });
  });

  await Promise.all(videoUploadPromises);
  fs.writeFileSync('./index.json', JSON.stringify(photoIndex, null, 4));
})('photos');
