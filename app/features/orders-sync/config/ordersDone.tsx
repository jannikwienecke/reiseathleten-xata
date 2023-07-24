import { LockClosedIcon } from "@heroicons/react/20/solid";

import type { ModelConfig } from "~/utils/lib/types";
import { NewOrdersConfig, getOrders, type OrderInterface } from "./ordersNew";

export const DoneOrderConfig: ModelConfig<OrderInterface> = {
  ...NewOrdersConfig,
  title: "Completed Orders",

  loader: async (props) => {
    return getOrders({
      ...props,
      allowedStatusList: ["completed"],
      orderBy: "endDate",
    });
  },

  view: {
    ...NewOrdersConfig.view,
    navigation: {
      icon: LockClosedIcon,
    },
  },
};
