import { VACATIONS } from "./vacation";

const fsPromises = require("fs").promises;

fsPromises
  .writeFile(
    "app/mock/db.json",
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
