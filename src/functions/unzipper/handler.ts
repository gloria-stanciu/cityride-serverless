import 'source-map-support/register';
import s3UnzipPlus from '../../libs/unzip'
import { middyfy } from '../../libs/lambda';

const unzipper = async function(event) {

  console.log(JSON.stringify(event, null, 2))

  const bucketName = event.Records[0].s3.bucket.name;
  const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  await new s3UnzipPlus({
    bucket: bucketName,
    file: filename,
    targetBucket: bucketName,
    copyMetadata: true,
    deleteOnSuccess: true,
    verbose: false
  }, function(err, data){
    if (err) console.log(err)
    else console.log(data)
  })
  
  console.log(`Bucket name is: ${bucketName}`)
  console.log(`Keyname is ${filename}`)

} 

export const main = middyfy(unzipper);
