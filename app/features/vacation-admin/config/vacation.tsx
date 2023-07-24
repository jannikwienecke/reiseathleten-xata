import { type VacationDescription } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import { GlobeAmericasIcon } from "@heroicons/react/20/solid";
import invariant from "tiny-invariant";
import { getFormDataValue } from "~/utils/lib/core";
import type { DataFunctionArgs, ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { createLoader } from "~/utils/stuff.server";
import { syncProductsUsecase } from "~/features/orders-sync/server-functions/sync-products";

export type VacationInterface = VacationDescription & {
  location: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacationDescription");

export const VacationConfig: ModelConfig<VacationInterface> = {
  title: "Vacation",
  parent: PARENT_BASE_KEY,
  loader: async ({ query }) => {
    const vacations = await prisma.vacationDescription.findMany({
      take: 30,
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            Location: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            status: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        Location: true,
      },
    });

    return vacations.map((v) => ({
      ...v,
      name: v.name || "",
      location: "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) => {
    const name = getFormDataValue(props.formData, "name");
    const description = getFormDataValue(props.formData, "description");
    const locationId = getFormDataValue(props.formData, "location");

    invariant(name, "Name is required");
    invariant(description, "Description is required");
    invariant(locationId, "Location is required");

    await prisma.vacationDescription.create({
      data: {
        name,
        description,
        locationId: +locationId,
      },
    });
  },

  onEdit: async (props) => {
    const url = new URL(props.request.url);
    const id = +(url.searchParams.get("id") || "");
    const name = getFormDataValue(props.formData, "name");
    const description = getFormDataValue(props.formData, "description");
    const locationId = getFormDataValue(props.formData, "location");

    invariant(name, "Name is required");
    invariant(description, "Description is required");
    invariant(locationId, "Location is required");

    await prisma.vacationDescription.update({
      where: {
        id: +id,
      },
      data: {
        name,
        description,
        locationId: +locationId,
      },
    });
  },

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  useAdvancedSearch: true,

  redirect: "/admin/Vacation",
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
      ],
    },
    detail: {
      getUrl: (id) => `/admin/vacations/${id}`,
    },
    AddForm: {
      title: "Create New Vacation",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "Vacation Name",
          minLength: 4,
          required: true,
        },
        {
          name: "description",
          label: "Description",
          Component: Form.DefaultInput,
          type: "textarea",
          minLength: 8,
          required: true,
        },
        {
          name: "location",
          label: "Location",
          required: true,
          Component: Form.Select,
          onGetOptions: async (query) => {
            const results = await prisma.location.findMany({
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
  actions: [
    {
      name: "syncProductsWooCommerce",
      label: "Sync Products",
      handler: async (args: DataFunctionArgs) => {
        await createLoader(syncProductsUsecase)(args);
      },
    },
  ],
};
