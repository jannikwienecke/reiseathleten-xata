import type { ConfigType } from "~/utils/lib/types";
// import { ActivityBookingConfig } from "./activity-booking";
import { ServiceConfig } from "./services";
import { NewOrdersConfig } from "./ordersNew";
import { CurrentOrdersConfig } from "./ordersCurrent";
import { DoneOrderConfig } from "./ordersDone";

export const CONFIG_ORDERS_PAGE: ConfigType = {
  models: {
    Service: ServiceConfig,
    Order: NewOrdersConfig,
    CurrentOrder: CurrentOrdersConfig,
    ClosedOrder: DoneOrderConfig,
    // ActivityBooking: ActivityBookingConfig,
  },
};
