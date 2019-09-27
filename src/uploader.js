import AWS from "aws-sdk"
import fs from "fs"
import Promise from "bluebird"
import path from "path"

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION
})

export default async function(bufferPromise, filename) {
  let buffer = await bufferPromise
  var s3 = new AWS.S3({ apiVersion: "2006-03-01" })
  var params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: "image/webp"
  }
  return s3.upload(params).promise()
}
