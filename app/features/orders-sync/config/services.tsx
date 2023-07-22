import { TagIcon } from "@heroicons/react/20/solid";
import { type Service } from "@prisma/client";
import invariant from "tiny-invariant";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { PARENT_BASE_KEY } from "~/features/vacation-admin/utils/helpers";
import { getFormDataValue } from "~/utils/lib/core";

import type { ActionFunctionArgs, ModelConfig } from "~/utils/lib/types";

export type ServiceInterface = Service & {};

export const ServiceConfig: ModelConfig<ServiceInterface> = {
  title: "Vacation Services",
  description:
    "Services that are included in the vacation package (e.g. food, transport etc.)",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const services = await prisma.service.findMany({});

    return services.map((t) => ({
      ...t,
    }));
  },

  // onDelete: async ({ formData }: ActionFunctionArgs) => {
  //   const id = +(getFormDataValue(formData, "id") || "");

  //   const orders = await prisma.order.findMany({});
  //   // const ordersx = orders[0]?.
  // },

  // onAdd: async ({ formData }: ActionFunctionArgs) => {
  //   //
  // },

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

  // onBulkDelete: async ({ formData }: ActionFunctionArgs) => {
  //   const idsToDelete = JSON.parse(
  //     getFormDataValue(formData, "ids") || "[]"
  //   ) as string[];

  //   await prisma.tag.deleteMany({
  //     where: {
  //       id: {
  //         in: idsToDelete.map((id) => +id),
  //       },
  //     },
  //   });
  // },

  redirect: "/admin/Service",
  view: {
    navigation: {
      icon: TagIcon,
    },
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
      title: "Service",
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
          type: "textarea",
          Component: Form.DefaultInput,
        },
      ],
    },
  },
};
