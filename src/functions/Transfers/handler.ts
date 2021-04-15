import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import {readCSV} from '../../libs/csvParse'

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Transfers, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const InsertTransfers = async function (input: Input) {
    try {
      const data = await s3.getObject({
        Bucket: "cityride-bucket-project",
        Key: "transfers/transfers.txt"
      }).promise()

      const parsedFile: Transfers[]= await readCSV(data.Body.toString())
      console.log(parsedFile[0]);
     
      for (const obj of parsedFile){
        await knex('transfers').insert({
          from_stop_id: obj.from_stop_id,
          to_stop_id: obj.to_stop_id,
          feed_id: input.feedId,
          transfer_type: parseInt(obj.transfer_type)|| null,
          min_transfer_time: parseInt(obj.min_transfer_time)|| null,
        }).onConflict(['feed_id', 'to_stop_id', 'from_stop_id']).merge()
      }

      return input
    } catch (err) {
      console.log(err);
    }
  };
  
  export const main = middyfy(InsertTransfers);
  