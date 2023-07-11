import { type Location } from "@prisma/client";
import invariant from "tiny-invariant";
import { Form } from "~/components";
import { prisma } from "~/db.server";
import { getFormDataValue } from "~/utils/lib/core";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  ModelConfig,
} from "~/utils/lib/types";

type LocationInterface = Location;

export const LocationConfig: ModelConfig<LocationInterface> = {
  title: "Locations",
  loader: async ({ request }: LoaderFunctionArgs) => {
    const locations = await prisma.location.findMany({});

    return locations.map((l) => ({
      ...l,
    }));
  },
  onAdd: async ({ formData }: ActionFunctionArgs) => {
    // name: getFormDataValue(formData, "name"),
    // description: getFormDataValue(formData, "description"),

    const name = getFormDataValue(formData, "name");
    const description = getFormDataValue(formData, "description");

    invariant(name, "name is required");
    invariant(description, "description is required");

    try {
      return await prisma.location.create({
        data: {
          name,
          description,
        },
      });
    } catch (e: any) {
      // TODO RUN MIGRATION TO ADD UNIQUE CONSTRAINT
      throw {
        message: e.message,
        status: e.status,
        field: "name",
        fieldMessage: "Name already exists",
      };
    }
  },

  onEdit: async ({ formData, request }: ActionFunctionArgs) => {
    const url = new URL(request.url);
    const id = +(url.searchParams.get("id") || "");

    const name = getFormDataValue(formData, "name");
    const description = getFormDataValue(formData, "description");

    invariant(id, "id is required");
    invariant(name, "label is required");
    invariant(description, "color is required");

    try {
      await prisma.location.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      });
    } catch (e: any) {
      throw {
        message: e.message,
        status: e.status,
        field: "name",
        fieldMessage: "Name already exists",
      };
    }
  },

  onDelete: async ({ formData }: ActionFunctionArgs) => {
    const id = +(formData?.get("id") || "");

    invariant(id, "id is required");

    await prisma.location.delete({
      where: {
        id,
      },
    });
  },

  onBulkDelete: async ({ formData }: ActionFunctionArgs) => {
    const idsToDelete = JSON.parse(
      getFormDataValue(formData, "ids") || "[]"
    ) as string[];

    await prisma.location.deleteMany({
      where: {
        id: {
          in: idsToDelete.map((id) => +id),
        },
      },
    });
  },

  redirect: "/admin/Location",
  view: {
    table: {
      columns: [
        {
          accessorKey: "name",
          header: "name",
        },
        {
          accessorKey: "description",
          header: "description",
        },
      ],
    },
    AddForm: {
      title: "Location",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "name",
          minLength: 3,
        },

        {
          Component: Form.DefaultInput,
          name: "description",
          label: "description",
          minLength: 5,
        },
      ],
    },
  },
};
