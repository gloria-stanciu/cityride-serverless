import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import { connectToDb } from "../../libs/knexfile";
import { readCSV } from "../../libs/csvParse";

import Knex from "knex";
import { middyfy } from "@libs/lambda";
import { Calendar, Calendar_Dates, Input } from "@libs/interfaces";

const knex = Knex(connectToDb);

interface Service {
  id: string;
  feed_id: string;
  Calendars: Calendar[];
  Calendar_Dates: Calendar_Dates[];
}

interface CalendarType {
  service_id: string;
  date;
  exception_type;
}

type ServiceId = string;
type Services = Record<ServiceId, Service>;

const InsertServicesAndTrips = async function (input: Input) {
  try {
    const data = await s3
      .getObject({
        Bucket: "cityride-bucket-project",
        Key: "calendar_dates/calendar_dates.txt",
      })
      .promise();

    const services: Services = {};

    const parsedFile: CalendarType[] = await readCSV(data.Body.toString());
    console.log(parsedFile[0]);

    const dateNow = new Date()
    const aYearFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString()

    for (const row of parsedFile) {
      if (services[row.service_id]) {
        if (row.service_id == "scoala-lv") {
          services[row.service_id].Calendars.push({
            feed_id: input.feedId,
            service_id: row.service_id,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
            start_date: dateNow,
            end_date: aYearFromNow,
          });
        } else if (row.service_id == "scoala-sd") {
          services[row.service_id].Calendars.push({
            feed_id: input.feedId,
            service_id: row.service_id,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: true,
            sunday: true,
            start_date: dateNow,
            end_date: aYearFromNow
          });
        }
        services[row.service_id].Calendar_Dates.push({
          feed_id: input.feedId,
          service_id: row.service_id,
          date_time: row.date,
          exception_type: row.exception_type,
        });
      } else {
        if (row.service_id == "scoala-lv") {
          services[row.service_id] = {
            id: row.service_id,
            feed_id: input.feedId,
            Calendars: [
              {
                feed_id: input.feedId,
                service_id: row.service_id,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false,
                start_date: dateNow,
                end_date: aYearFromNow,
              },
            ],
            Calendar_Dates: [
              {
                feed_id: input.feedId,
                service_id: row.service_id,
                date_time: row.date,
                exception_type: row.exception_type,
              },
            ],
          };
        } else if (row.service_id == "scoala-sd") {
          services[row.service_id] = {
            id: row.service_id,
            feed_id: input.feedId,
            Calendars: [
              {
                feed_id: input.feedId,
                service_id: row.service_id,
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: true,
                sunday: true,
                start_date: dateNow,
                end_date: aYearFromNow,
              },
            ],
            Calendar_Dates: [
              {
                feed_id: input.feedId,
                service_id: row.service_id,
                date_time: row.date,
                exception_type: parseInt(row.exception_type),
              },
            ],
          };
        }
      }
    }

    for (const service of Object.values(services)) {
      const currentService = await knex("services")
        .where("id", service.id)
        .andWhere("feed_id", input.feedId);
      if (currentService.length == 0) {
        await knex("services")
          .insert({
            id: service.id,
            feed_id: input.feedId,
          })
          .onConflict(["id", "feed_id"])
          .merge();
        await knex.batchInsert(
          "calendars",
          service.Calendars,
          service.Calendars.length
        );
        await knex.batchInsert(
          "calendar_dates",
          service.Calendar_Dates,
          service.Calendar_Dates.length
        );
      } else {
        await knex("calendars").where("service_id", service.id).del();
        await knex("calendar_dates").where("service_id", service.id).del();
        await knex("services").where("id", service.id).update({
          id: service.id,
          feed_id: input.feedId,
        });
        await knex.batchInsert(
          "calendars",
          service.Calendars,
          service.Calendars.length
        );
        await knex.batchInsert(
          "calendar_dates",
          service.Calendar_Dates,
          service.Calendar_Dates.length
        );
      }
    }

    return input;
  } catch (err) {
    console.log(err);
  }
};

export const main = middyfy(InsertServicesAndTrips);
