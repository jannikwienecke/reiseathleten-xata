import { LockClosedIcon } from "@heroicons/react/20/solid";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { NewOrdersConfig, type OrderInterface } from "./ordersNew";

export const DoneOrderConfig: ModelConfig<OrderInterface> = {
  ...NewOrdersConfig,
  title: "Completed Orders",

  loader: async () => {
    const orders = await prisma.order.findMany({
      where: {
        status: "completed",
      },
    });

    return orders.map((t) => ({
      ...t,
      price: t.price.toNumber(),
    }));
  },

  view: {
    ...NewOrdersConfig.view,
    navigation: {
      icon: LockClosedIcon,
    },
  },
};
