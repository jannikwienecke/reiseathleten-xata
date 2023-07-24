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
  email: string;
};

export const NewOrdersConfig: ModelConfig<OrderInterface> = {
  title: "New Orders",
  parent: "Orders",
  loader: async (props) => {
    const query = new URL(props.request.url).searchParams.get("query") || "";

    let userIds: { user_id: number }[] = [];
    if (query) {
      userIds = await prisma.customer.findMany({
        select: {
          user_id: true,
        },
        where: {
          OR: [
            {
              first_name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              last_name: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      });
    }

    const orders = await prisma.order.findMany({
      // sorted by the date_created -> newest first
      orderBy: {
        date_created: "desc",
      },

      take: 30,
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
        // query -> check start_date and end_date if the string is included
        OR: [
          {
            User: {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            User: {
              id: {
                in: userIds.map((t) => t.user_id),
              },
            },
          },

          {
            Vacation: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });

    return orders.map((t) => ({
      ...t,
      price: t.price.toNumber(),
      username:
        t.User.Customer[0].first_name + " " + t.User.Customer[0].last_name,
      email: t.User.email,
    }));
  },

  useAdvancedSearch: true,
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
        },
        {
          accessorKey: "email",
          header: "Email",
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
