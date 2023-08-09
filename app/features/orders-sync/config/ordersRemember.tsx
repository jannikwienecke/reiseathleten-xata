import { LockClosedIcon } from "@heroicons/react/20/solid";

import type { ModelConfig } from "~/utils/lib/types";
import { NewOrdersConfig, getOrders, type OrderInterface } from "./ordersNew";
import { prisma } from "~/db.server";
import { formatDateString } from "~/features/vacation-admin/utils/helpers";

export const ReminderOderConfig: ModelConfig<OrderInterface> = {
  ...NewOrdersConfig,
  title: "Reminder Orders",

  loader: async (props) => {
    const ordersToRemind = await prisma.orderReminder.findMany({
      where: {
        date: {
          lte: new Date(),
        },
      },
    });

    const orderIds = ordersToRemind.map((order) => order.order_id);

    const oders = await getOrders({
      ...props,
      allowedStatusList: ["invoiced", "paid", "validated", "pending"],
      orderBy: "startDate",
      orderIds,
    });

    return oders.map((o) => {
      return {
        ...o,
        reminder: ordersToRemind
          .find((order) => order.order_id === o.id)
          ?.date.toISOString(),
      };
    });
  },

  view: {
    ...NewOrdersConfig.view,
    table: {
      ...NewOrdersConfig.view.table,
      columns: [
        {
          accessorKey: "reminder",
          header: "Reminder",
          formatValue: formatDateString,
        },
        ...NewOrdersConfig.view.table.columns,
        {
          accessorKey: "reminder",
          header: "Reminder",
          formatValue: formatDateString,
        },
      ],
    },
    navigation: {
      icon: LockClosedIcon,
    },
  },
};
