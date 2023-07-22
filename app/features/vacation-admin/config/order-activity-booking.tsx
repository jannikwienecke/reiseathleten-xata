import { Form } from "~/components";
import { prisma } from "~/db.server";

import { BookOpenIcon } from "@heroicons/react/20/solid";
import { getDateString } from "~/utils/helper";
import type { ModelConfig } from "~/utils/lib/types";
import { VACATION_BOOKING_APP_key, formatDateString } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { type OrderActivity } from "@prisma/client";

export type OrderActivityBookingInterface = OrderActivity & {
  vacationName: string;
  activityName: string;
  email: string;
  activity: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacationActivity");

export const OrderActivityBookingConfig: ModelConfig<OrderActivityBookingInterface> =
  {
    title: "Order Activity Bookings",
    parent: VACATION_BOOKING_APP_key,
    loader: async () => {
      const activityBookings = await prisma.orderActivity.findMany({
        include: {
          Order: {
            include: {
              User: true,
              Vacation: true,
            },
          },
          AcitivityDescription: {
            select: {
              name: true,
            },
          },
        },
      });

      return activityBookings.map((a) => ({
        ...a,
        vacationName: a?.Order.Vacation?.name || "",
        activityName: a.AcitivityDescription?.name || "",
        email: a?.Order?.User?.email || "",
        activity: "",
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
      table: {
        columns: [
          {
            accessorKey: "vacationName",
            header: "Vacation Name",
          },
          {
            accessorKey: "activityName",
            header: "Activity",
          },
          {
            accessorKey: "email",
            header: "Customer",
          },
          {
            accessorKey: "datetime",
            header: "Date Time",
            formatValue: formatDateString,
          },
        ],
      },
      AddForm: {
        title: "Update Activity Booking",
        fields: [
          {
            Component: Form.DefaultInput,
            name: "datetime",
            label: "Date Time",
            type: "datetime-local",
            formatValue: (value: string | undefined) =>
              value ? getDateString(new Date(value)) : "",
          },
        ],
      },
    },
  };
