import { getMediaMetadata } from './get-media-metadata.js';
import fs from 'fs-extra';
import globby from 'globby';
import BlueBird from 'bluebird';
import sharp from 'sharp';
import { basename } from 'path';
import { uploadJpeg } from './uploader.js';

let photoIndex = fs.readJsonSync('./index.json');

const generateOutputFiles = (
  sizes: number[],
  filename: string,
  format: string,
) => {
  return sizes.map((size) => {
    return {
      width: size,
      filename: `${filename}-w${size}.${format}`,
    };
  });
};

const processPhoto = async (p) => {
  // const meta = await getMediaMetadata(p, buffer);
  // const processedPhotoPromises = generateOutputFiles(
  //   [2100, 1600, 1200, 700, 250],
  //   meta.file,
  //   'jpeg',
  // )
  //   .map((obj) => {
  //     process.stdout.write('P');
  //     return {
  //       filename: basename(obj.filename),
  //       buffer: sharp(buffer)
  //         .resize(obj.width)
  //         .jpeg({ quality: 85 } as sharp.JpegOptions)
  //         .toBuffer(),
  //     };
  //   })
  //   .concat([
  //     {
  //       filename: `${meta.file}-wFull.jpeg`,
  //       buffer: sharp(buffer)
  //         .jpeg({ quality: 85 } as sharp.JpegOptions)
  //         .toBuffer(),
  //     },
  //   ])
  //   .map((p) => {
  //     return uploadJpeg(p.buffer, p.filename);
  //   });
  // await BlueBird.all(processedPhotoPromises).then(() => {
  //   fs.unlink(p);
  // });
  // return meta;
};

export default async function() {
  const paths = await globby(['photos/*.{jpg,JPG}']);

  fs.writeFileSync('./index.json', JSON.stringify(photoIndex, null, 4));
}
