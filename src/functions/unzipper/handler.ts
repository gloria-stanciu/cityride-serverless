import 'source-map-support/register';
import { S3Event } from 'aws-lambda'
import { s3UnzipPlus } from '../../libs/unzip'
import { middyfy } from '../../libs/lambda'
import * as AWS from "aws-sdk"

const unzipper = async function(event: S3Event) {
  const bucketName: string = event.Records[0].s3.bucket.name;
  const filename: string = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  try {
    await s3UnzipPlus({
      bucket: bucketName,
      targetBucket: bucketName,
      file: filename,
      copyMetadata: true,
      deleteOnSuccess: true,
      verbose: false,
    })
    const statemachine_arn = process.env.statemachine_arn 
    const params:AWS.StepFunctions.StartExecutionInput = {
      stateMachineArn: statemachine_arn,
      input: `{"feedId": ""}`
    }
    const stepFunctions = new AWS.StepFunctions()
    const stateMachine = await stepFunctions.startExecution(params).promise()
    console.log(stateMachine)
  } catch (err) {
    console.log(err)
  }
} 

export const main = middyfy(unzipper);
