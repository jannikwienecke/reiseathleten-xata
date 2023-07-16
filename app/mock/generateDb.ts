import { VACATIONS } from "./vacation";
import { ORDERS } from "./orders";
const fsPromises = require("fs").promises;

fsPromises
  .writeFile(
    "app/mock/db.json",
    JSON.stringify({
      vacations: VACATIONS,
      orders: ORDERS,
    })
  )
  .then(() => {
    console.log("JSON saved");
  })
  .catch((err: any) => {
    console.log(err);
  });
