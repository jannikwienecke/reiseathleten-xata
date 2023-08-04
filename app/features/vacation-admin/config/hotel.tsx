import { CogIcon } from "@heroicons/react/20/solid";
import { type Room } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { getFormDataValue } from "~/utils/lib/core";
import invariant from "tiny-invariant";

export type HotelInterface = Room & {
  locationName: string;
  contactName: string;
  contactId: number | null;
  locationId: number | null;
  hotel: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "hotel");

export const HotelConfig: ModelConfig<HotelInterface> = {
  title: "Hotels",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const hotels = await prisma.hotel.findMany({
      include: {
        Contact: true,
        Location: true,
      },
    });

    return hotels.map((t) => ({
      ...t,
      locationName: t?.Location?.name || "",
      contactName:
        (t?.Contact?.first_name || "") + " " + (t?.Contact?.last_name || ""),
      contactId: t.contactId,
      locationId: t.locationId,
      hotel: "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async ({ formData }) => {
    const name = getFormDataValue(formData, "name");
    const locationId = getFormDataValue(formData, "locationName");
    const contactId = getFormDataValue(formData, "contactName");

    invariant(name, "name is required");
    invariant(locationId, "locationId is required");
    invariant(contactId, "contactId is required");

    await prisma.hotel.create({
      data: {
        name,
        Contact: {
          connect: {
            id: +contactId,
          },
        },
        Location: {
          connect: {
            id: +locationId,
          },
        },
      },
    });
  },

  onEdit: async ({ formData, request }) => {
    const url = new URL(request.url);
    const id = +(url.searchParams.get("id") || "");

    const name = getFormDataValue(formData, "name");
    const locationId = getFormDataValue(formData, "locationName");
    const contactId = getFormDataValue(formData, "contactName");

    invariant(name, "name is required");
    invariant(locationId, "locationId is required");
    invariant(contactId, "contactId is required");

    await prisma.hotel.update({
      where: {
        id,
      },
      data: {
        name,
        Contact: {
          connect: {
            id: +contactId,
          },
        },
        Location: {
          connect: {
            id: +locationId,
          },
        },
      },
    });
  },

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Hotel",
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
          accessorKey: "locationName",
          header: "Location",
        },
        {
          accessorKey: "contactName",
          header: "Contact",
        },
      ],
    },
    AddForm: {
      title: "Hotel",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "Hotel Name",
        },
        {
          Component: Form.Select,
          name: "locationName",
          label: "Location",
          selectField: {
            fieldId: "locationId",
          },
          onGetOptions: async (query) => {
            const locations = await prisma.location.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return locations.map((t) => ({
              id: t.id,
              name: t.name,
            }));
          },
        },

        {
          Component: Form.Select,
          name: "contactName",
          label: "Contact",
          selectField: {
            fieldId: "contactId",
          },

          onGetOptions: async (query) => {
            const contacts = await prisma.contact.findMany({
              where: {
                OR: [
                  {
                    first_name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    last_name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            });

            return contacts.map((t) => ({
              id: t.id,
              name: t.first_name + " " + t.last_name,
            }));
          },
        },

        {
          Component: Form.Select,
          name: "hotel",
          label: "Hotel",
          selectField: {
            fieldId: "id",
          },

          onGetOptions: async (query) => {
            const hotels = await prisma.hotel.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return hotels.map((t) => ({
              id: t.id,
              name: t.name,
            }));
          },
        },
      ],
    },
  },
};
