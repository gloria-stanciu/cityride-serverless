import "source-map-support/register";
import { S3Event } from "aws-lambda";
import { middyfy } from "../../libs/lambda";
import { connectToDb } from "../../libs/knexfile";
import Knex from "knex";

// const dbUrl = process.env.DATABASE_URL;
const knex = Knex(connectToDb);

const agencies = async function (event: S3Event) {
  try {
    console.log(JSON.stringify(event, null, 2));

    const bucketName = event.Records[0].s3.bucket.name;
    const filename = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    console.log(`Bucket name is: ${bucketName}`);
    console.log(`Keyname is ${filename}`);
    await knex.raw("SELECT 1+1 AS RESULT");
    console.log("Connected to db");
  } catch (err) {
    console.log(err);
  }
};

export const main = middyfy(agencies);
