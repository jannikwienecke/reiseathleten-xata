import { VACATIONS } from "./vacation";
import { ORDERS } from "./orders";
import { VACATION_DESCRIPTIONS } from "./vacation-description";
import { vacationServices, services } from "./vacation-services";
const fsPromises = require("fs").promises;

fsPromises
  .writeFile(
    "app/mock/db.json",
    JSON.stringify({
      vacations: VACATIONS,
      orders: ORDERS,
      vacationDescriptions: VACATION_DESCRIPTIONS,
      vacationServices,
      services,
    })
  )
  .then(() => {
    console.log("JSON saved");
  })
  .catch((err: any) => {
    console.log(err);
  });
