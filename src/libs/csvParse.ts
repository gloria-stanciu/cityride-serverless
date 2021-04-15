import * as csv from "csv-parse/lib/sync";

function readCSV(file:string) {
  try {
    const parsed = csv(file, {
      columns: true,
      skip_empty_lines: true
    });

    return parsed;
  } catch (err) {
    console.log(`readCSV error \n ${err}`);
  }
}

export {readCSV}