import { InboxIcon } from "@heroicons/react/20/solid";
import { type Order } from "@prisma/client";
import { prisma } from "~/db.server";
import { formatDateString } from "~/features/vacation-admin/utils/helpers";

import invariant from "tiny-invariant";
import { isLoggedIn } from "~/utils/helper";
import { getFormDataValue } from "~/utils/lib/core";
import type { ActionFunctionArgs, ModelConfig, Tag } from "~/utils/lib/types";
import { createLoader } from "~/utils/stuff.server";
import { type OrderStatusValueObject } from "../domain/order-status";
import { syncOrdersUsecase } from "../server-functions/sync-orders";

export type OrderInterface = Omit<Order, "price"> & {
  price: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  tags: Tag[];
};

const ORDER_BY_OPTIONS = {
  created: { date_created: "desc" },
  startDate: { start_date: "desc" },
  endDate: { end_date: "desc" },
} as const;

export const getOrders = async ({
  query,
  sortBy,
  allowedStatusList,
  orderBy,
  tags,
}: {
  query?: string;
  tags?: Tag[];
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  allowedStatusList: OrderStatusValueObject["value"][];
  orderBy: keyof typeof ORDER_BY_OPTIONS;
}) => {
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

  const orderByEmail = sortBy?.field === "email";

  let _orderBy: any = {};

  if (orderByEmail) {
    _orderBy = {
      User: {
        email: sortBy?.direction,
      },
    };
  } else {
    _orderBy = sortBy?.field
      ? {
          [sortBy.field]: sortBy.direction,
        }
      : ORDER_BY_OPTIONS[orderBy];
  }

  const orders = await prisma.order.findMany({
    orderBy: _orderBy,

    take: 30,
    include: {
      Vacation: {
        select: {
          name: true,
        },
      },
      OrderTag: true,
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
      status: {
        in: allowedStatusList,
      },

      // id: 1444,
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

  const _orders = tags?.length
    ? orders.filter((order) => {
        const allTagsOfOrder = order.OrderTag?.map((tag) => tag.label);

        return tags?.every((tag) => allTagsOfOrder?.includes(tag.label));
      })
    : orders;

  return _orders.map((t) => ({
    ...t,
    price: t.price.toNumber(),
    last_name: t.User.Customer[0].last_name,
    first_name: t.User.Customer[0].first_name,
    username:
      t.User.Customer[0].first_name + " " + t.User.Customer[0].last_name,
    email: t.User.email,
    tags: t.OrderTag?.map((tag) => ({
      label: tag.label,
      color: tag.color,
    })),
  }));
};

export const NewOrdersConfig: ModelConfig<OrderInterface> = {
  title: "New Orders",
  parent: "Orders",
  loader: async (props) => {
    return getOrders({
      ...props,
      allowedStatusList: ["pending"],
      orderBy: "created",
      sortBy: props.sortBy,
      tags: props.tags,
    });
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
          accessorKey: "tags",
          header: "Tags",
        },
        {
          accessorKey: "first_name",
          header: "First Name",
          disableSortBy: true,
        },
        {
          accessorKey: "last_name",
          header: "Last Name",
          disableSortBy: true,
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
      fields: [],
    },
  },
  actions: [
    {
      name: "syncOrdersWooCommerce",
      label: "Sync Orders",
      handler: async (args: ActionFunctionArgs) => {
        await createLoader(syncOrdersUsecase)(args);
      },
    },
  ],
};
