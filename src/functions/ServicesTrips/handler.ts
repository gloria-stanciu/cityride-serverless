import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import { readCSV } from "../../libs/csvParse";

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Trips, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

const InsertServicesAndTrips = async function (input: Input) {
  try {
    const data = await s3
      .getObject({
        Bucket: "cityride-bucket-project",
        Key: "trips/trips.txt",
      })
      .promise();

    const parsedFile: Trips[] = await readCSV(data.Body.toString());
    console.log(parsedFile[0]);

    for (const obj of parsedFile) {
      await knex("services")
        .insert({
          id: obj.service_id,
          feed_id: input.feedId,
        })
        .onConflict(["id", "feed_id"])
        .merge();

      await knex("trips")
        .insert({
          id: obj.trip_id,
          feed_id: input.feedId,
          route_id: obj.route_id,
          service_id: obj.service_id,
          headsign: obj.headsign,
          short_name: obj.short_name,
          direction_id: parseInt(obj.direction_id),
          block_id: obj.block_id,
          shape_id: obj.shape_id,
          wheelchair_accessible: parseInt(obj.wheelchair_accessible),
          bikes_allowed: parseInt(obj.bikes_allowed),
          is_visible: obj.is_visible,
        })
        .onConflict(["id", "feed_id"])
        .merge();
    }

    return input;
  } catch (err) {
    console.log(err);
  }
};

export const main = middyfy(InsertServicesAndTrips);
