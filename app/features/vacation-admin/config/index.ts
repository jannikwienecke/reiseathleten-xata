import type { ConfigType } from "~/utils/lib/types";
import { LocationConfig } from "./location";
import { TagConfig } from "./tag";
import { ActivityConfig } from "./activity";
import { VacationConfig } from "./vacation";

export const CONFIG: ConfigType = {
  models: {
    Location: LocationConfig,
    Tag: TagConfig,
    Activity: ActivityConfig,
    Vacation: VacationConfig,
  },
};
