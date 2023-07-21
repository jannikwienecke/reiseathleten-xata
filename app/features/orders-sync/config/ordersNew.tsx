import { InboxIcon } from "@heroicons/react/20/solid";
import { type Order } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { formatDateString } from "~/features/vacation-admin/utils/helpers";

import type { DataFunctionArgs, ModelConfig } from "~/utils/lib/types";
import { syncOrdersUsecase } from "../server-functions/sync-orders";
import { createLoader } from "~/utils/stuff.server";

export type OrderInterface = Omit<Order, "price"> & {
  price: number;
};

export const NewOrdersConfig: ModelConfig<OrderInterface> = {
  title: "New Orders",
  parent: "Orders",
  loader: async () => {
    const orders = await prisma.order.findMany({
      where: {
        status: "pending",
      },
    });

    return orders.map((t) => ({
      ...t,
      price: t.price.toNumber(),
    }));
  },

  redirect: "/admin/Order",
  view: {
    navigation: {
      icon: InboxIcon,
    },
    detail: {
      getUrl: (id) => `/admin/orders/${id}`,
    },
    table: {
      columns: [
        {
          accessorKey: "order_key",
          header: "Order",
        },
        {
          accessorKey: "date_created",
          header: "Created",
          formatValue: formatDateString,
        },
        {
          accessorKey: "start_date",
          header: "Start",
          formatValue: formatDateString,
        },
        {
          accessorKey: "end_date",
          header: "End",
          formatValue: formatDateString,
        },
        {
          accessorKey: "price",
          header: "Price",
          formatValue(value) {
            return `${value.toFixed(2)} €`;
          },
        },
      ],
    },
    AddForm: {
      title: "Order",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "price",
          label: "Price",
          type: "number",
        },
      ],
    },
  },
  actions: [
    {
      name: "syncOrdersWooCommerce",
      label: "Sync Orders",
      handler: async (args: DataFunctionArgs) => {
        await createLoader(syncOrdersUsecase)(args);
      },
    },
  ],
};
