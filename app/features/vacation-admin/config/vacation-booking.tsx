import { type Vacation } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { GlobeAmericasIcon } from "@heroicons/react/20/solid";
import { VACATION_BOOKING_APP_key, formatDateString } from "../utils/helpers";
import { getFormDataValue } from "~/utils/lib/core";
import invariant from "tiny-invariant";

export type VacationBookingInterface = Vacation & {
  user: string;
  activity: string;
  name: string;
  activityDescription: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacation");

export const VacationBookingsConfig: ModelConfig<VacationBookingInterface> = {
  title: "Vacation Bookings",
  parent: VACATION_BOOKING_APP_key,
  loader: async () => {
    const vacations = await prisma.vacation.findMany({
      include: {
        User: true,
        VacationDescription: true,
      },
    });

    return vacations.map((v) => ({
      ...v,
      user: v.User?.email || "",
      activity: "",
      activityDescription: "",
      name: v.VacationDescription.name || "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) => {
    const userId = getFormDataValue(props.formData, "user");
    const startDate = getFormDataValue(props.formData, "startDate");
    const endDate = getFormDataValue(props.formData, "endDate");
    const vacationDescriptionId = getFormDataValue(props.formData, "name");

    invariant(userId, "User is required");
    invariant(vacationDescriptionId, "Vacation is required");
    invariant(startDate, "Start Date is required");
    invariant(endDate, "End Date is required");

    const defaultActivitiesForThisVacation =
      await prisma.defaultVacationActivity.findMany({
        select: {
          activityDescriptionId: true,
        },
        where: {
          vacationDescriptionId: +vacationDescriptionId,
        },
      });

    const vacationBooking = await prisma.vacation.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        User: {
          connect: {
            id: +userId,
          },
        },
        VacationDescription: {
          connect: {
            id: +vacationDescriptionId,
          },
        },
      },
    });

    await prisma.vacationActivity.createMany({
      data: defaultActivitiesForThisVacation.map((a) => ({
        activityDescriptionId: a.activityDescriptionId,
        vacationId: vacationBooking.id,
      })),
    });
  },

  onEdit: async (props) => {
    const url = new URL(props.request.url);
    const activityId = url.searchParams.get("id");
    const startDate = getFormDataValue(props.formData, "startDate");
    const endDate = getFormDataValue(props.formData, "endDate");

    invariant(startDate, "Start Date is required");
    invariant(endDate, "End Date is required");
    invariant(activityId, "Activity is required");

    await prisma.vacation.update({
      where: {
        id: +activityId,
      },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
  },

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Tag",
  view: {
    navigation: {
      icon: GlobeAmericasIcon,
    },
    table: {
      columns: [
        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "user",
          header: "Customer",
        },
        {
          accessorKey: "startDate",
          header: "Start Date",
          formatValue: formatDateString,
        },
        {
          accessorKey: "endDate",
          header: "End Date",
          formatValue: formatDateString,
        },
      ],
    },
    detail: {},
    AddForm: {
      title: "Activity",
      fields: [
        {
          name: "user",
          label: "Customer Mail",
          Component: Form.Select,
          onGetOptions: async (query) => {
            const results = await prisma.user.findMany({
              where: {
                OR: {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            });

            return results.map((r) => ({
              id: r.id,
              name: r.email,
            }));
          },
        },
        {
          name: "name",
          label: "Select Vacation",
          Component: Form.Select,
          onGetOptions: async (query) => {
            const results = await prisma.vacationDescription.findMany({
              where: {
                OR: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            });

            return results.map((r) => ({
              id: r.id,
              name: r.name,
            }));
          },
        },
        {
          name: "startDate",
          label: "Start Date",
          type: "date",
          formatValue: formatDateString,
          Component: Form.DefaultInput,
        },
        {
          name: "endDate",
          label: "End Date",
          type: "date",
          formatValue: formatDateString,
          Component: Form.DefaultInput,
        },
      ],
    },
  },
};
