import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Stops, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const InsertStops = async function (input: Input) {
    try {
      const data = await s3.getObject({
        Bucket: "cityride-bucket-project",
        Key: "stops/stops.txt"
      }).promise()

      const parsedFile: Stops[]= await readCSV(data.Body.toString())
      console.log(parsedFile[0]);
     
      for (const obj of parsedFile){
        await knex('stops').insert({
          id: obj.stop_id,
          feed_id: input.feedId,
          code: obj.stop_code,
          name: obj.stop_name,
          desc: obj.stop_desc,
          lat: obj.stop_lat,
          long: obj.stop_lon,
          zone_id: parseInt(obj.zone_id) || null,
          stop_url: obj.stop_url,
          location_type: parseInt(obj.location_type) || null,
          parent_station: obj.parent_station,
          stop_timezone: obj.stop_timezone,
          wheelchair_boarding: parseInt(obj.wheelchair_boarding) || null
        }).onConflict(['id', 'feed_id']).merge()
      }

      return input
    } catch (err) {
      console.log(err);
    }
  };
  
  export const main = middyfy(InsertStops);
  