import AWS from 'aws-sdk';
import { getMediaMetadata } from '../get-media-metadata';

const s3 = new AWS.S3();

export const handler = async (event: any = {}, context): Promise<any> => {
  const record = event.Records[0];
  const image = {
    bucketName: record.s3.bucket.name,
    bucketArn: record.s3.bucket.arn,
    size: record.s3.object.size,
    key: record.s3.object.key,
  };

  try {
    const params = {
      Bucket: image.bucketName,
      Key: image.key,
    };
    const imageFile = await s3.getObject(params).promise();
    console.log(typeof imageFile.Body);
    const metadata = await getMediaMetadata(image.key, imageFile.Body);
    console.log(metadata);
  } catch (error) {
    console.log(error);
    return;
  }

  return;
};

// export const handler = async (event: any = {}): Promise<any> => {
//   console.log('Hello World!');
//   const response = JSON.stringify(event, null, 2);
//   return response;
// };

// EVENT SAMPLE
// {
//   Records: [
//     {
//       eventVersion: '2.1',
//       eventSource: 'aws:s3',
//       awsRegion: 'us-east-1',
//       eventTime: '2020-04-04T00:09:48.325Z',
//       eventName: 'ObjectCreated:Put',
//       userIdentity: { principalId: 'AWS:AIDAIDTLIZOTCUZUM574O' },
//       requestParameters: { sourceIPAddress: '68.2.79.252' },
//       responseElements: {
//         'x-amz-request-id': 'ECEDEFBE6E634ACD',
//         'x-amz-id-2': 'Wc+gAXZIpCbI+caW55US8PktQVbTqaizj4cPx0A5NN+KPihlKB6KBAcdb7CpWMO1gfvKXZOp4ztS1buld65hP8CPfmR9Kpav'
//       },
//       s3: {
//         s3SchemaVersion: '1.0',
//         configurationId: '3ff56f33-d866-42c6-b1af-17a529216cbf',
//         bucket: {
//           name: 'together-blog',
//           ownerIdentity: { principalId: 'A2WN96LCLWM16S' },
//           arn: 'arn:aws:s3:::together-blog'
//         },
//         object: {
//           key: 'originals/IMG_0119.jpg',
//           size: 829122,
//           eTag: '4fa9101d82dde80fd0244f08dd63a605',
//           sequencer: '005E87D03AAF5D4B70'
//         }
//       }
//     }
//   ]
// }
