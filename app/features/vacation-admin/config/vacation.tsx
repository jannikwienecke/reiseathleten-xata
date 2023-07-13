import { Vacation, type AcitivityDescription } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type VacationInterface = Vacation & {
  email: string;
  location: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacation");

export const VacationConfig: ModelConfig<VacationInterface> = {
  title: "Vacation",
  loader: async () => {
    const vacations = await prisma.vacation.findMany({
      include: {
        User: true,
        Location: true,
        VacationActivity: {
          include: {
            ActivityBooking: {
              include: {
                AcitivityDescription: true,
              },
            },
          },
        },
      },
    });

    console.log(vacations[0].VacationActivity);

    return vacations.map((v) => ({
      ...v,
      email: v.User?.email || "",
      location: v.Location?.name || "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: ["name", "description"],
    }),

  onEdit: async (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: ["name", "description"],
    }),

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Tag",
  view: {
    table: {
      columns: [
        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "description",
          header: "Description",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "location",
          header: "Location",
        },
        {
          accessorKey: "startDate",
          header: "Start Date",
        },
        {
          accessorKey: "endDate",
          header: "End Date",
        },
      ],
    },
    detail: {},
    AddForm: {
      title: "Activity",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "Name",
          minLength: 4,
        },
        {
          name: "description",
          label: "Description",
          Component: Form.DefaultInput,
          minLength: 8,
        },
        {
          name: "email",
          label: "Email",
          Component: Form.DefaultInput,
          minLength: 8,
        },
        {
          name: "startDate",
          label: "Start Date",
          Component: Form.DefaultInput,
          minLength: 8,
        },
        {
          name: "endDate",
          label: "End Date",
          Component: Form.DefaultInput,
          minLength: 8,
        },
      ],
    },
  },
};
