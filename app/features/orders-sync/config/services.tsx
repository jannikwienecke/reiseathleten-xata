import { TagIcon } from "@heroicons/react/20/solid";
import { type Service } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { PARENT_BASE_KEY } from "~/features/vacation-admin/utils/helpers";
import { PrismaCrudHandler } from "~/features/vacation-admin/utils/prisma-crud-handler";

import type { ModelConfig } from "~/utils/lib/types";

export type ServiceInterface = Service & {};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "service");

export const ServiceConfig: ModelConfig<ServiceInterface> = {
  title: "Services",
  description:
    "Services that are included in the vacation package (e.g. food, transport etc.)",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const services = await prisma.service.findMany({});

    return services.map((t) => ({
      ...t,
    }));
  },
  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: ["name", "description"],
    }),

  onEdit: (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: ["name", "description"],
    }),

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

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
