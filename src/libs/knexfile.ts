"use strict";

export const connectToDb = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
};
