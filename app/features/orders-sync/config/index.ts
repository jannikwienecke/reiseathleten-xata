import type { ConfigType } from "~/utils/lib/types";
// import { ActivityBookingConfig } from "./activity-booking";
import { ServiceConfig } from "./services";
import { NewOrdersConfig } from "./ordersNew";
import { CurrentOrdersConfig } from "./ordersCurrent";
import { DoneOrderConfig } from "./ordersDone";
import { ReminderOderConfig } from "./ordersRemember";

export const CONFIG_ORDERS_PAGE: ConfigType = {
  models: {
    Service: ServiceConfig,
    Reminders: ReminderOderConfig,
    NewOrder: NewOrdersConfig,
    CurrentOrder: CurrentOrdersConfig,
    ClosedOrder: DoneOrderConfig,

    // ActivityBooking: ActivityBookingConfig,
  },
};
