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
  username: string;
};

export const NewOrdersConfig: ModelConfig<OrderInterface> = {
  title: "New Orders",
  parent: "Orders",
  loader: async () => {
    const orders = await prisma.order.findMany({
      include: {
        Vacation: {
          select: {
            name: true,
          },
        },
        User: {
          include: {
            Customer: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
      where: {
        status: "pending",
      },
    });

    return orders.map((t) => ({
      ...t,
      price: t.price.toNumber(),
      username:
        t.User.Customer[0].first_name + " " + t.User.Customer[0].last_name,
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
          accessorKey: "username",
          header: "User",
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
