import type { ConfigType } from "~/utils/lib/types";
import { LocationConfig } from "./location";
import { TagConfig } from "./tag";
import { ActivityConfig } from "./activity";
import { VacationConfig } from "./vacation";
import { OrderActivityBookingConfig } from "./order-activity-booking";
import { ActivityTagConfig } from "./activity-tag";
import { ColorConfig } from "./color";
import { CustomerConfig } from "./customer";
import { DefaultVacationActivityConfig } from "./vacation-default-activity";
import { OrderVacationConfig } from "./orders";

export const CONFIG: ConfigType = {
  models: {
    Vacation: VacationConfig,
    OrderVacation: OrderVacationConfig,
    VacationActivity: OrderActivityBookingConfig,
    Location: LocationConfig,
    Tag: TagConfig,
    Activity: ActivityConfig,
    ActivityTag: ActivityTagConfig,
    Color: ColorConfig,
    Customer: CustomerConfig,
    DefaultActivityVacation: DefaultVacationActivityConfig,
  },
};
