import bcrypt from "bcryptjs";
import type { VacationDtoProps } from "../features/vacation";
import { RawOrder } from "~/features/orders-sync/api/types";
import { Service, VacationDescription, VacationServices } from "@prisma/client";
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const dbJson: {
  vacations: VacationDtoProps[];
  orders: RawOrder[];
  vacationDescriptions: VacationDescription[];
  vacationServices: VacationServices[];
  services: Service[];
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

server.get("/vacations/:id", (req: any, res: any) => {
  const vacation = dbJson.vacations.find(
    (v) => v.vacation.id === Number(req.params.id)
  );

  res.jsonp(vacation);
});

server.get("/vacations", (req: any, res: any) => {
  res.jsonp(dbJson.vacations.map((v) => v.vacation));
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
      if (v.vacation.id.toString() !== vacationId.toString()) {
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

// /orders
server.get("/orders", (req: any, res: any) => {
  res.jsonp({
    data: JSON.stringify(dbJson.orders),
  });
});

server.get("/vacation-descriptions", (req: any, res: any) => {
  console.log("GET", dbJson.vacationDescriptions);

  res.jsonp({
    data: dbJson.vacationDescriptions,
  });
});

server.get("/vacation-descriptions/:id", (req: any, res: any) => {
  const vacationDescription = dbJson.vacationDescriptions.find(
    (v) => v.id.toString() === req.params.id
  );

  res.jsonp({
    data: vacationDescription,
  });
});

server.get("/vacation/:id/services", (req: any, res: any) => {
  const filtered = dbJson.vacationServices.filter(
    (v) => v.vacation_id.toString() === req.params.id.toString()
  );

  const filteredServices = dbJson.services.filter((service) => {
    return filtered.find((v) => v.service_id === service.id);
  });

  res.jsonp({
    data: filteredServices,
  });
});

server.get("/order/:id", (req: any, res: any) => {
  const order = dbJson.orders.find((v) => v.id.toString() === req.params.id);

  res.jsonp({
    data: order,
  });
});

server.post("/order", (req: any, res: any) => {
  const newOrder = req.body;

  if (!newOrder) {
    res.status(400).jsonp({
      error: "New Order Missing params",
    });
  }

  dbJson.orders.push(newOrder);

  res.jsonp({ success: true });
});

server.put("/order", (req: any, res: any) => {
  const newOrder = req.body;

  if (!newOrder) {
    res.status(400).jsonp({
      error: "New Order Missing params",
    });
  }

  dbJson.orders = dbJson.orders.map((order) => {
    if (order.id.toString() === newOrder.id.toString()) {
      return newOrder;
    } else {
      return order;
    }
  });

  res.jsonp({ success: true });
});

server.post("/vacation-descriptions", (req: any, res: any) => {
  const newVacationDescription = req.body;

  if (!newVacationDescription) {
    res.status(400).jsonp({
      error: "Missing params",
    });
  }

  dbJson.vacationDescriptions.push(newVacationDescription);

  res.jsonp({ success: true });
});

server.put("/vacation-descriptions", (req: any, res: any) => {
  const newVacationDescription = req.body;

  console.log("id", newVacationDescription.id);
  console.log({ newVacationDescription });

  if (!newVacationDescription) {
    res.status(400).jsonp({
      error: "Missing params",
    });
  }

  dbJson.vacationDescriptions = dbJson.vacationDescriptions.map((v) => {
    if (v.id.toString() === newVacationDescription.id.toString()) {
      console.log("return ", newVacationDescription);

      return newVacationDescription;
    }
    return v;
  });

  res.jsonp({ success: true, ok: true });
});

server.post("/auth/signup", (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).jsonp({
      error: "Missing params",
    });
  }

  const user = {
    id: 1,
    email,
    password,
  };

  res.jsonp(user);
});

server.post("/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).jsonp({
      error: "Missing email",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = {
    id: 1,
    email,
    password: hashedPassword,
  };

  res.jsonp(user);
});

// POST /auth/hasUserWithEmail
server.post("/auth/hasUserWithEmail", async (req: any, res: any) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).jsonp({
      error: "Missing email",
    });
  }

  const user = {
    id: 1,
    email,
  };

  // res.jsonp(user);
  res.jsonp({
    user: null,
  });
});

// Use default router
server.use(router);
server.listen(port, () => {
  console.log("JSON Server is running on port " + port);
});
