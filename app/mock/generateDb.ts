import { VACATIONS } from "./mock/vacation";

const fsPromises = require("fs").promises;

fsPromises
  .writeFile(
    "db.json",
    JSON.stringify({
      vacations: VACATIONS,
    })
  )
  .then(() => {
    console.log("JSON saved");
  })
  .catch((err: any) => {
    console.log(err);
  });
