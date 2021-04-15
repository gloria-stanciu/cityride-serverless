import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Agency, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const fcn2 = async function (input: Input) {
  try {
    const data = await s3.getObject({
      Bucket: "cityride-bucket-project",
      Key: "agency/agency.txt"
    }).promise()

    const parsedFile: [Agency]= await readCSV(data.Body.toString())
    console.log(parsedFile[0]);

    for (const obj of parsedFile){
      await knex('agencies').insert({
        id: obj.agency_id,
        feed_id: input.feedId,
        name: obj.agency_name,
        url: obj.agency_url,
        timezone: obj.agency_timezone,
        lang: obj.agency_lang,
        phone: obj.agency_phone,
        fare_url: obj.agency_url,
        email: obj.agency_email
      }).onConflict(['id', 'feed_id']).merge()
    }
    
    console.log('Insert/Update in agencies successfully made!')
    return input
  } catch (err) {
    console.log(err);
  }
};

export const main = middyfy(fcn2);