import * as AWS from "aws-sdk"

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION
})

const uploadJpeg = async function(
  bufferPromise: Promise<Buffer>,
  filename: string
) {
  process.stdout.write("U")
  let buffer = await bufferPromise
  var s3 = new AWS.S3({ apiVersion: "2006-03-01" })
  var params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: "image/jpeg"
  }
  return s3.upload(params).promise()
}

const uploadJSON = async function(file: string, filename: string) {
  var s3 = new AWS.S3({ apiVersion: "2006-03-01" })
  var params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: file,
    ContentType: "application/json"
  }
  return s3.upload(params).promise()
}

const uploadM4v = async function(file: Buffer, filename: string) {
  var s3 = new AWS.S3({ apiVersion: "2006-03-01" })
  var params = {
    Bucket: process.env.BUCKET,
    Key: filename,
    Body: file,
    ContentType: "video/x-m4v"
  }
  return s3.upload(params).promise()
}

export { uploadJpeg, uploadJSON, uploadM4v }
