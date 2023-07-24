import { BoltIcon } from "@heroicons/react/20/solid";

import type { ModelConfig } from "~/utils/lib/types";
import { NewOrdersConfig, getOrders, type OrderInterface } from "./ordersNew";

export const CurrentOrdersConfig: ModelConfig<OrderInterface> = {
  ...NewOrdersConfig,
  title: "Current Orders",

  loader: async (props) => {
    return getOrders({
      ...props,
      allowedStatusList: ["validated", "invoiced", "paid"],
      orderBy: "startDate",
    });
  },

  view: {
    ...NewOrdersConfig.view,
    navigation: {
      icon: BoltIcon,
    },
  },
};
