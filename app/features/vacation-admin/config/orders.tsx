import { Form } from "~/components";
import { prisma } from "~/db.server";

import { BookOpenIcon } from "@heroicons/react/20/solid";
import { Order, Prisma } from "@prisma/client";
import { getDateString } from "~/utils/helper";
import type { ModelConfig } from "~/utils/lib/types";
import { VACATION_BOOKING_APP_key, formatDateString } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type OrdersViewInterface = Omit<Order, "price"> & {
  vacationName: string;
  email: string;
  activity: string;
  price: string;
  activityDescriptionId: number;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacationActivity");

export const OrderVacationConfig: ModelConfig<OrdersViewInterface> = {
  title: "Orders Vacation",
  parent: VACATION_BOOKING_APP_key,
  loader: async () => {
    const activityBookings = await prisma.order.findMany({
      include: {
        Vacation: true,
        User: true,
        OrderActivity: true,
      },
      // status is not completed
      where: {
        status: {
          not: "completed",
        },
      },
    });

    return activityBookings.map(({ price, ...a }) => ({
      ...a,
      price: new Prisma.Decimal(price).toString(),
      vacationName: a?.Vacation?.name || "",
      email: a?.User?.email || "",
      activity: "",
      activityDescriptionId: 0,
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onEdit: async (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: ["datetime"],
      fieldTransforms: {
        datetime: (value) => new Date(value),
      },
      optionalFields: ["datetime"],
    }),

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Tag",
  view: {
    navigation: {
      icon: BookOpenIcon,
    },
    detail: {
      // getUrl: (id) => `/admin/vacation-order/${id}`,
    },
    table: {
      columns: [
        {
          accessorKey: "email",
          header: "Customer",
        },
        {
          accessorKey: "vacationName",
          header: "Vacation Name",
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
      ],
    },
    AddForm: {
      title: "Update Activity Booking",
      fields: [
        {
          Component: Form.Select,
          name: "activity",
          label: "Activity",
          selectField: {
            fieldId: "activityDescriptionId",
          },

          onGetOptions: async (query) => {
            const activities = await prisma.acitivityDescription.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return activities.map((t) => ({
              name: t.name,
              id: t.id,
            }));
          },
        },
      ],
    },
  },
};
