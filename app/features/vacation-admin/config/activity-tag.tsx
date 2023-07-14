import { TagIcon } from "@heroicons/react/20/solid";
import { type AcitivityTag } from "@prisma/client";
import invariant from "tiny-invariant";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { getFormDataValue } from "~/utils/lib/core";

import type { ActionFunctionArgs, ModelConfig } from "~/utils/lib/types";

export type ActivityTagsInterface = AcitivityTag & {
  tag: string;
  activity: string;
  color: string;
};

export const ActivityTagConfig: ModelConfig<ActivityTagsInterface> = {
  title: "Activity Tags",
  loader: async () => {
    const tags = await prisma.acitivityTag.findMany({
      include: {
        Tag: {
          include: {
            Color: true,
          },
        },
        AcitivityDescription: true,
      },
      orderBy: {
        AcitivityDescription: {
          name: "asc",
        },
      },
    });

    return tags.map((t) => ({
      ...t,
      activity: t.AcitivityDescription?.name || "",
      tag: t.Tag?.label || "",
      color: t.Tag.Color?.name || "",
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
    const activity = getFormDataValue(formData, "activity");
    const tag = getFormDataValue(formData, "tag");

    invariant(activity, "label is required");
    invariant(tag, "color is required");

    await prisma.acitivityTag.create({
      data: {
        AcitivityDescription: {
          connect: {
            id: +activity,
          },
        },
        Tag: {
          connect: {
            id: +tag,
          },
        },
      },
    });
  },

  onEdit: async ({ formData, request }: ActionFunctionArgs) => {
    const url = new URL(request.url);
    const id = +(url.searchParams.get("id") || "");

    const tag = getFormDataValue(formData, "tag");

    invariant(tag, "tag is required");

    await prisma.acitivityTag.update({
      where: {
        id,
      },
      data: {
        Tag: {
          connect: {
            id: +tag,
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
          accessorKey: "activity",
          header: "Activity",
        },
        {
          accessorKey: "tag",
          header: "Tag",
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
          Component: Form.Select,
          name: "tag",
          label: "Tag",
          selectField: {
            fieldId: "tagId",
          },

          onGetOptions: async (query) => {
            const tags = await prisma.tag.findMany({
              include: {
                Color: true,
              },
              where: {
                label: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return tags.map((t) => ({
              name: t.label,
              id: t.id,
              color: t.Color?.name || "",
            }));
          },
        },

        {
          Component: Form.Select,
          name: "activity",
          label: "Activity",
          selectField: {
            fieldId: "activityDescriptionId",
          },

          onGetOptions: async (query) => {
            const tags = await prisma.acitivityDescription.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return tags.map((t) => ({
              name: t.name,
              id: t.id,
            }));
          },
        },
      ],
    },
  },
};
