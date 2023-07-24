import { CogIcon } from "@heroicons/react/20/solid";
import { type DefaultVacationActivity } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { getFormDataValue } from "~/utils/lib/core";
import invariant from "tiny-invariant";

export type DefaultVacationAcitvity = DefaultVacationActivity & {
  name: string;
  acitivityName: string;
};

const prismaCrudHandler = new PrismaCrudHandler(
  prisma,
  "defaultVacationActivity"
);

export const DefaultVacationActivityConfig: ModelConfig<DefaultVacationAcitvity> =
  {
    title: "Default Vacation Activities",
    description:
      "Default activities for a vacation. Those will be added to the vacation when it is created.",
    parent: PARENT_BASE_KEY,
    loader: async () => {
      const defaultActivities = await prisma.defaultVacationActivity.findMany({
        include: {
          VacationDescription: true,
          AcitivityDescription: true,
        },
      });

      return defaultActivities.map((t) => ({
        ...t,
        name: t.VacationDescription.name || "",
        acitivityName: t.AcitivityDescription.name || "",
      }));
    },

    onDelete: (props) => prismaCrudHandler.delete(props),

    onAdd: async ({ formData }) => {
      const name = getFormDataValue(formData, "name");
      const acitivityName = getFormDataValue(formData, "acitivityName");

      invariant(name, "name is required");
      invariant(acitivityName, "acitivityName is required");

      await prisma.defaultVacationActivity.create({
        data: {
          VacationDescription: {
            connect: {
              id: +name,
            },
          },
          AcitivityDescription: {
            connect: {
              id: +acitivityName,
            },
          },
        },
      });
    },

    onEdit: async (props) => {
      const url = new URL(props.request.url);
      const id = +(url.searchParams.get("id") || "");
      const name = getFormDataValue(props.formData, "name");
      const acitivityName = getFormDataValue(props.formData, "acitivityName");

      invariant(name, "name is required");
      invariant(acitivityName, "acitivityName is required");

      await prisma.defaultVacationActivity.update({
        where: {
          id: id,
        },
        data: {
          VacationDescription: {
            connect: {
              id: +name,
            },
          },
          AcitivityDescription: {
            connect: {
              id: +acitivityName,
            },
          },
        },
      });
    },

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
            accessorKey: "acitivityName",
            header: "Activity Name",
          },
        ],
      },
      AddForm: {
        title: "Default Vacation Activity",
        fields: [
          {
            Component: Form.Select,
            name: "name",
            label: "Vacation",
            selectField: {
              fieldId: "vacationDescriptionId",
            },

            onGetOptions: async (query) => {
              const vacations = await prisma.vacationDescription.findMany({
                where: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              });

              return vacations.map((t) => ({
                name: t.name,
                id: t.id,
              }));
            },
          },

          {
            Component: Form.Select,
            name: "acitivityName",
            label: "Activity",
            selectField: {
              fieldId: "activityDescriptionId",
            },

            onGetOptions: async (query) => {
              const activities = await prisma.acitivityDescription.findMany({
                where: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              });

              return activities.map((t) => ({
                name: t.name,
                id: t.id,
              }));
            },
          },
        ],
      },
    },
  };
