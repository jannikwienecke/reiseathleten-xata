import type { ConfigType } from "~/utils/lib/types";
import { LocationConfig } from "./location";
import { TagConfig } from "./tag";
import { ActivityConfig } from "./activity";
// import { ActivityBookingConfig } from "./activity-booking";
import { VacationBookingsConfig } from "./vacation-booking";
import { VacationConfig } from "./vacation";
import { VacationActivityBookingConfig } from "./activity-booking";

export const CONFIG: ConfigType = {
  models: {
    Vacation: VacationConfig,
    VacationBooking: VacationBookingsConfig,
    VacationActivity: VacationActivityBookingConfig,
    Location: LocationConfig,
    Tag: TagConfig,
    Activity: ActivityConfig,

    // ActivityBooking: ActivityBookingConfig,
  },
};
