import type { ConfigType } from "~/utils/lib/types";
import { LocationConfig } from "./location";
import { TagConfig } from "./tag";

export const CONFIG: ConfigType = {
  models: {
    Location: LocationConfig,
    Tag: TagConfig,
  },
};
