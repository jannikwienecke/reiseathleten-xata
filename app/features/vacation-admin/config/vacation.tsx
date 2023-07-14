import { type VacationDescription } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import { GlobeAmericasIcon } from "@heroicons/react/20/solid";
import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { getFormDataValue } from "~/utils/lib/core";
import invariant from "tiny-invariant";

export type VacationInterface = VacationDescription & {
  location: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacationDescription");

export const VacationConfig: ModelConfig<VacationInterface> = {
  title: "Vacation",
  loader: async () => {
    const vacations = await prisma.vacationDescription.findMany({
      include: {
        Location: true,
      },
    });

    return vacations.map((v) => ({
      ...v,
      location: v.Location?.name || "",
      name: v.name || "",
      description: v.description || "",
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

    console.log({
      id,
      name,
      description,
      locationId,
    });

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
          accessorKey: "description",
          header: "Description",
          formatValue(value) {
            return value.length > 40 ? value.slice(0, 40) + "..." : value;
          },
        },
        {
          accessorKey: "location",
          header: "Location",
        },
      ],
    },
    // detail: {},
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
};
