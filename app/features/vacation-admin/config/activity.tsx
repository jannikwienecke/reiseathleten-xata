import { type AcitivityDescription } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import { RocketLaunchIcon } from "@heroicons/react/20/solid";
import type { ModelConfig } from "~/utils/lib/types";
import { VACATION_BOOKING_APP_key, getWeekDayString } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type ActivityInterface = AcitivityDescription & {
  fixedTime: string;
  tags: string;
};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "acitivityDescription");

export const ActivityConfig: ModelConfig<ActivityInterface> = {
  title: "Activities",
  parent: VACATION_BOOKING_APP_key,
  loader: async () => {
    const activities = await prisma.acitivityDescription.findMany({
      include: {
        AcitivityTag: {
          include: {
            Tag: true,
          },
        },
      },
    });

    return activities.map((a) => {
      const hasFixedTime = a.fixed_hour && a.fixed_minute && a.fixed_day;
      const weekday = a.fixed_day ? getWeekDayString(a.fixed_day) : "";
      const fixedTimeString = hasFixedTime
        ? `${weekday} ${a.fixed_hour}:${a.fixed_minute}`
        : "";

      return {
        ...a,
        fixedTime: fixedTimeString,
        tags: a.AcitivityTag.map((at) => at.Tag.label).join(", "),
      };
    });
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: async (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: [
        "name",
        "description",
        "fixed_hour",
        "fixed_minute",
        "fixed_day",
      ],
      fieldTransforms: {
        fixed_hour: (value) => Number(value),
        fixed_minute: (value) => Number(value),
        fixed_day: (value) => Number(value),
      },
    }),

  onEdit: async (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: [
        "name",
        "description",
        "fixed_hour",
        "fixed_minute",
        "fixed_day",
      ],
      fieldTransforms: {
        fixed_hour: (value) => Number(value),
        fixed_minute: (value) => Number(value),
        fixed_day: (value) => Number(value),
      },
    }),

  onBulkDelete: async (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Tag",
  view: {
    navigation: {
      icon: RocketLaunchIcon,
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
        {
          accessorKey: "fixedTime",
          header: "Fixed Time",
        },
        {
          accessorKey: "tags",
          header: "Tags",
        },
      ],
    },
    AddForm: {
      title: "Activity",
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
          Component: Form.DefaultInput,
          minLength: 8,
        },
        {
          name: "fixed_hour",
          label: "At fixed hour",
          Component: Form.DefaultInput,
          type: "number",
          min: 0,
          max: 23,
        },
        {
          name: "fixed_minute",
          label: "At fixed minute",
          Component: Form.DefaultInput,
          type: "number",
          min: 0,
          max: 59,
        },
        {
          name: "fixed_day",
          label: "At fixed day",
          Component: Form.DefaultInput,
          type: "number",
          min: 0,
          max: 6,
        },
      ],
    },
  },
};
