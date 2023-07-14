import { type Vacation } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { GlobeAmericasIcon } from "@heroicons/react/20/solid";
import { formatDateString } from "../utils/helpers";
import { getFormDataValue } from "~/utils/lib/core";
import invariant from "tiny-invariant";

export type VacationBookingInterface = Vacation & {
  user: string;
  activity: string;
  name: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacation");

export const VacationBookingsConfig: ModelConfig<VacationBookingInterface> = {
  title: "Vacation Bookings",
  loader: async () => {
    const vacations = await prisma.vacation.findMany({
      include: {
        User: true,
        VacationDescription: true,
        // VacationActivity: {

        // }

        // VacationActivity: {
        //   include: {
        //     ActivityBooking: {
        //       include: {
        //         AcitivityDescription: true,
        //       },
        //     },
        //   },
        // },
      },
    });

    return vacations.map((v) => ({
      ...v,
      user: v.User?.email || "",
      activity: "",
      name: v.VacationDescription.name || "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) => {
    const userId = getFormDataValue(props.formData, "user");
    const vacationId = getFormDataValue(props.formData, "name");
    const startDate = getFormDataValue(props.formData, "startDate");
    const endDate = getFormDataValue(props.formData, "endDate");

    invariant(userId, "User is required");
    invariant(vacationId, "Vacation is required");
    invariant(startDate, "Start Date is required");
    invariant(endDate, "End Date is required");

    const defaultActivitiesForThisVacation =
      await prisma.defaultVacationActivity.findMany({
        select: {
          activityDescriptionId: true,
        },
        where: {
          vacationDescriptionId: +vacationId,
        },
      });

    // TODO HIER WEITER MACHEN
    // await prisma.activityBooking.createMany({
    //   data: defaultActivitiesForThisVacation.map((a) => ({
    //     datetime: new Date(),
    //     //  isFixedDate

    //     acitivityDescriptionId: a.activityDescriptionId,
    //   })),
    // });

    // await prisma.vacationActivity.createMany({
    //   data:  defaultActivitiesForThisVacation.map((a) => ({
    //     activityBookingId
    //     vacationId: 1,
    //   })),

    // });

    await prisma.vacation.create({
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
            id: +vacationId,
          },
        },
      },
    });
  },

  onEdit: async (props) => {
    //
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
        {
          name: "activityDescription",
          label: "Activity",
          Component: Form.Select,
          onGetOptions: async (query) => {
            const results = await prisma.acitivityDescription.findMany({
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
      ],
    },
  },
};
