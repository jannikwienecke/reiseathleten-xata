import { type VacationServices } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import { GlobeAmericasIcon } from "@heroicons/react/20/solid";
import invariant from "tiny-invariant";
import { getFormDataValue } from "~/utils/lib/core";
import type { ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type VacationInterface = VacationServices & {
  vacationName: string;
  serviceName: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "vacationServices");

export const VacationServicesConfig: ModelConfig<VacationInterface> = {
  title: "Vacation Services",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const vacations = await prisma.vacationServices.findMany({
      include: {
        Service: true,
        Vacation: true,
      },
    });

    return vacations.map((v) => ({
      ...v,
      vacationName: v.Vacation?.name || "",
      serviceName: v.Service?.name || "",
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) => {
    const serviceId = getFormDataValue(props.formData, "serviceName");
    const vacationId = getFormDataValue(props.formData, "vacationName");

    invariant(serviceId, "serviceName is required");
    invariant(vacationId, "vacationName is required");

    await prisma.vacationServices.create({
      data: {
        Vacation: {
          connect: {
            id: +vacationId,
          },
        },
        Service: {
          connect: {
            id: +serviceId,
          },
        },
      },
    });
  },

  onEdit: async (props) => {
    const url = new URL(props.request.url);
    const id = +(url.searchParams.get("id") || "");
    const serviceId = getFormDataValue(props.formData, "serviceName");
    const vacationId = getFormDataValue(props.formData, "vacationName");

    invariant(serviceId, "serviceName is required");
    invariant(vacationId, "vacationName is required");

    await prisma.vacationServices.update({
      where: {
        id: +id,
      },
      data: {
        Vacation: {
          connect: {
            id: +vacationId,
          },
        },
        Service: {
          connect: {
            id: +serviceId,
          },
        },
      },
    });
  },

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/VacationServices",
  view: {
    navigation: {
      icon: GlobeAmericasIcon,
    },
    table: {
      columns: [
        {
          accessorKey: "vacationName",
          header: "Vacation Name",
        },
        {
          accessorKey: "serviceName",
          header: "Service Name",
        },
      ],
    },
    // detail: {},
    AddForm: {
      title: "Create New Vacation",
      fields: [
        {
          Component: Form.Select,
          name: "vacationName",
          label: "Vacation Name",

          onGetOptions: async (query) => {
            const vacations = await prisma.vacationDescription.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return vacations.map((s) => ({
              id: s.id,
              label: s.name,
              name: s.name,
            }));
          },
        },

        {
          Component: Form.Select,
          name: "serviceName",
          label: "Service Name",

          onGetOptions: async (query) => {
            const services = await prisma.service.findMany({
              where: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            });

            return services.map((s) => ({
              id: s.id,
              label: s.name,
              name: s.name,
            }));
          },
        },
      ],
    },
  },
};
