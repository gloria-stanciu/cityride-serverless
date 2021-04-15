import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { StopTimes, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const InsertStopTimes = async function (input: Input) {
    try {
      const data = await s3.getObject({
        Bucket: "cityride-bucket-project",
        Key: "stop_times/stop_times.txt"
      }).promise()

      const parsedFile: StopTimes[]= await readCSV(data.Body.toString())
      console.log(parsedFile[0]);
     
      for (const obj of parsedFile){
        await knex('stop_times').insert({
          trip_id: obj.trip_id,
          feed_id: input.feedId,
          arrival_time: obj.arrival_time,
          departure_time: obj.departure_time,
          stop_id: obj.stop_id,
          stop_sequence: parseInt(obj.stop_sequence)|| null,
          stop_headsign: obj.stop_headsign,
          pickup_type: parseInt(obj.pickup_type)|| null,
          dropoff_type: parseInt(obj.dropoff_type)|| null,
          timepoint: parseInt(obj.timepoint)|| null,
          shape_dist_traveled: obj.shape_dist_traveled,
        }).onConflict(['trip_id', 'feed_id', 'stop_id']).merge()
      }

      return input
    } catch (err) {
      console.log(err);
    }
  };
  
  export const main = middyfy(InsertStopTimes);
  