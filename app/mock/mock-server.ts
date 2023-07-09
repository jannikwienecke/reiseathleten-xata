import type { VacationDtoProps } from "../features/vacation";
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const dbJson: {
  vacations: VacationDtoProps[];
} = require("./db.json");

const ENV = process.env;
const port = ENV.MOCK_SERVER_PORT || 3001;

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
// POST/PATCH/PUT MUST COME AFTER THIS LINE
server.use([jsonServer.bodyParser]);

server.use((req: Request, res: any, next: () => null) => {
  console.log(" ");

  if (req.method === "GET") {
    console.log(`🐱 ${req.method} ${req.url}`);
  } else {
    console.log(`🐶 ${req.method} ${req.url}`);
    console.log(req.body);
  }

  if (res.statusCode === 200) {
    console.log("✅ Request successful");
  } else {
    console.log("❌ Some error happened: Status code: ", res.statusCode);
  }
  console.log(" ");

  next();
});

server.get("/vacations", (req: Request, res: any) => {
  res.jsonp(dbJson.vacations);
});

server.post("/vacations/:id/update-activity-date", (req: any, res: any) => {
  const vacationId = req.params.id;
  const { activityId, date } = req.body;

  if (!vacationId || !activityId || !date) {
    res.status(400).jsonp({
      error: "Missing params",
    });
  }

  const vacations: VacationDtoProps[] = dbJson.vacations.map(
    (v: VacationDtoProps) => {
      if (v.vacation.id !== vacationId) {
        return v;
      }

      return {
        ...v,
        activities: v.activities.map((a) => {
          if (a.id === activityId) {
            return {
              ...a,
              datetime: date,
            };
          }
          return a;
        }),
      };
    }
  );

  dbJson.vacations = vacations;

  res.jsonp({ status: "success" });
});

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("JSON Server is running on port " + port);
});
