import { InboxIcon, TagIcon } from "@heroicons/react/20/solid";
import { type Order } from "@prisma/client";
import invariant from "tiny-invariant";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { formatDateString } from "~/features/vacation-admin/utils/helpers";
import { getFormDataValue } from "~/utils/lib/core";

import type { ActionFunctionArgs, ModelConfig } from "~/utils/lib/types";

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
};
