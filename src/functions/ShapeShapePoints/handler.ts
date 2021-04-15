import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import { readCSV } from "../../libs/csvParse";

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { ShapePoints, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

interface Shape {
  id: string;
  feed_id: string;
  points: Point[];
}

interface Point {
  shape_id: string | null;
  feed_id: string;
  lat: string;
  long: string;
  sequence: string;
  shape_dist_traveled: string | null;
}

type ShapeId = string;
type Shapes = Record<ShapeId, Shape>;

const InsertShapeAndShapePoints = async function (input: Input) {
  try {
    const data = await s3
      .getObject({
        Bucket: "cityride-bucket-project",
        Key: "shapes/shapes.txt",
      })
      .promise();

    const shapes: Shapes = {};

    const parsedFile: ShapePoints[] = await readCSV(data.Body.toString());
    console.log(parsedFile[0]);

    for (const row of parsedFile) {
      if (shapes[row.shape_id]) {
        shapes[row.shape_id].points.push({
          shape_id: row.shape_id,
          feed_id: input.feedId,
          lat: row.shape_pt_lat,
          long: row.shape_pt_lon,
          sequence: row.shape_pt_sequence,
          shape_dist_traveled: row.shape_dist_traveled,
        });
      } else {
        shapes[row.shape_id] = {
          id: row.shape_id,
          feed_id: input.feedId,
          points: [
            {
              shape_id: row.shape_id,
              feed_id: input.feedId,
              lat: row.shape_pt_lat,
              long: row.shape_pt_lon,
              sequence: row.shape_pt_sequence,
              shape_dist_traveled: row.shape_dist_traveled,
            },
          ],
        };
      }
    }

    for (const shape of Object.values(shapes)) {
      const currentShape = await knex("shapes")
        .where("id", shape.id)
        .andWhere("feed_id", input.feedId);
      console.log(currentShape.length);
      if (currentShape.length === 0) {
        await knex("shapes").insert({
          id: shape.id,
          feed_id: input.feedId,
        });
        await knex.batchInsert(
          "shape_points",
          shape.points,
          shape.points.length
        );
      } else {
        await knex("shape_points").where("shape_id", shape.id).del();
        await knex("shapes").where("id", shape.id).update({
          id: shape.id,
          feed_id: input.feedId,
        }); 
        await knex.batchInsert(
          "shape_points",
          shape.points,
          shape.points.length
        );
      }
    }

    return input;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const main = middyfy(InsertShapeAndShapePoints);
