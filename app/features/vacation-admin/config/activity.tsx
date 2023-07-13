import { type AcitivityDescription } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type ActivityInterface = AcitivityDescription;

const prismaCrudHandler = new PrismaCrudHandler(prisma, "acitivityDescription");

export const ActivityConfig: ModelConfig<ActivityInterface> = {
  title: "Activity",
  loader: async () => {
    const activity = await prisma.acitivityDescription.findMany();

    return activity;
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
      ],
    },
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
      ],
    },
  },
};
