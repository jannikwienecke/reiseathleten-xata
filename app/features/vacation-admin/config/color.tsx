import { CogIcon } from "@heroicons/react/20/solid";
import { type Color } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type ColorInterface = Color & {
  color: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "color");

export const ColorConfig: ModelConfig<ColorInterface> = {
  title: "Colors",
  loader: async () => {
    const colors = await prisma.color.findMany({});

    return colors.map((t) => ({
      ...t,
      color: t.name || "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: ["name"],
    }),

  onEdit: (props) => prismaCrudHandler.update({ ...props, fields: ["name"] }),

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Color",
  view: {
    navigation: {
      icon: CogIcon,
    },
    table: {
      columns: [
        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "color",
          header: "",
          isColor: true,
        },
      ],
    },
    AddForm: {
      title: "Tag",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "Color",
        },
      ],
    },
  },
};
