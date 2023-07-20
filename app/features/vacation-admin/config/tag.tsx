import { TagIcon } from "@heroicons/react/20/solid";
import { TvIcon } from "@heroicons/react/24/solid";
import { type Tag } from "@prisma/client";
import invariant from "tiny-invariant";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { getFormDataValue } from "~/utils/lib/core";

import type { ActionFunctionArgs, ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";

export type TagInterface = Tag & {
  color: string;
  colorId: number;
};

export const TagConfig: ModelConfig<TagInterface> = {
  title: "Tags",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const tags = await prisma.tag.findMany({
      include: {
        Color: true,
      },
    });

    return tags.map((t) => ({
      ...t,
      color: t.Color?.name || "",
    }));
  },

  onDelete: async ({ formData }: ActionFunctionArgs) => {
    const id = +(getFormDataValue(formData, "id") || "");
    invariant(id, "id is required");

    await prisma.tag.delete({
      where: {
        id,
      },
    });
  },

  onAdd: async ({ formData }: ActionFunctionArgs) => {
    const label = getFormDataValue(formData, "label");
    const color = getFormDataValue(formData, "color");

    invariant(label, "label is required");
    invariant(color, "color is required");

    await prisma.tag.create({
      data: {
        label,
        Color: {
          connect: {
            id: +color,
          },
        },
      },
    });
  },

  onEdit: async ({ formData, request }: ActionFunctionArgs) => {
    const url = new URL(request.url);
    const id = +(url.searchParams.get("id") || "");

    const label = getFormDataValue(formData, "label");
    const color = getFormDataValue(formData, "color");

    invariant(id, "id is required");
    invariant(label, "label is required");
    invariant(color, "color is required");

    await prisma.tag.update({
      where: {
        id,
      },
      data: {
        label,
        Color: {
          connect: {
            id: +color,
          },
        },
      },
    });
  },

  onBulkDelete: async ({ formData }: ActionFunctionArgs) => {
    const idsToDelete = JSON.parse(
      getFormDataValue(formData, "ids") || "[]"
    ) as string[];

    await prisma.tag.deleteMany({
      where: {
        id: {
          in: idsToDelete.map((id) => +id),
        },
      },
    });
  },

  redirect: "/admin/Tag",
  view: {
    navigation: {
      icon: TagIcon,
    },
    table: {
      columns: [
        {
          accessorKey: "label",
          header: "Label",
        },
        {
          accessorKey: "color",
          header: "Color",
          isColor: true,
        },
      ],
    },
    AddForm: {
      title: "Tag",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "label",
          label: "Label",
          minLength: 4,
        },
        {
          name: "color",
          label: "Color",
          selectField: {
            fieldId: "colorId",
          },
          Component: Form.Select,
          onGetOptions: async (query) => {
            const colors = await prisma.color.findMany({
              where: {
                name: {
                  contains: query,
                },
              },
            });

            return colors.map((c) => ({
              ...c,
              name: c.name,
              color: c.name,
            }));
          },
        },

        // {
        //   name: "color2",
        //   label: "Color",
        //   Component: Form.Select,
        //   onGetOptions: async (query) => {
        //     const colors = await prisma.color.findMany({
        //       where: {
        //         name: {
        //           contains: query,
        //         },
        //       },
        //     });

        //     return colors.map((c) => ({
        //       ...c,
        //       name: c.name,
        //       color: c.name,
        //     }));
        //   },
        // },
      ],
    },
  },
};
