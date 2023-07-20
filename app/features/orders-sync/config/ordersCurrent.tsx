import { BoltIcon, InboxIcon } from "@heroicons/react/20/solid";
import { type Order } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { NewOrdersConfig, type OrderInterface } from "./ordersNew";

export const CurrentOrdersConfig: ModelConfig<OrderInterface> = {
  ...NewOrdersConfig,
  title: "Current Orders",

  loader: async () => {
    const orders = await prisma.order.findMany({
      where: {
        status: "validated",
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
      icon: BoltIcon,
    },
  },
};
