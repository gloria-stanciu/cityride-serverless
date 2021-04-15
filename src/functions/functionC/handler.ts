import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Routes, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const fcn3 = async function (input: Input) {
    try {
      const data = await s3.getObject({
        Bucket: "cityride-bucket-project",
        Key: "routes/routes.txt"
      }).promise()

      const parsedFile: Routes[]= await readCSV(data.Body.toString())
      console.log(parsedFile[0]);
     
      for (const obj of parsedFile){
        await knex('routes').insert({
          id: obj.route_id,
          feed_id: input.feedId,
          agency_id: obj.agency_id,
          short_name: obj.route_short_name,
          long_name: obj.route_long_name,
          desc: obj.route_desc,
          type: parseInt(obj.route_type),
          url: obj.route_url,
          color: obj.route_color,
          text_color: obj.route_text_color
        }).onConflict(['id', 'agency_id', 'feed_id']).merge()
      }

      return input
    } catch (err) {
      console.log(err);
    }
  };
  
  export const main = middyfy(fcn3);
  