import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Feed, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const fcn1 = async function (input: Input) {
  try {

    const data = await s3.getObject({
      Bucket: "cityride-bucket-project",
      Key: "feed/feed.txt"
    }).promise()

    const parsedFile: [Feed] = await readCSV(data.Body.toString())
    console.log(parsedFile[0]);

    await knex('feeds').insert(parsedFile[0]).onConflict('id').merge()
    
 
    const newFeedId = await knex('feeds').where({id: parsedFile[0].id}).select('id')
    console.log("Feed: " + newFeedId[0].id)
    
    console.log('Insert/Update in feed successufully made!')

    input.feedId = newFeedId[0].id
    return input
  } catch (err) {
    console.log(err);
  }
};

export const main = middyfy(fcn1);
