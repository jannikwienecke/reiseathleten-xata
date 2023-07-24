import { CogIcon } from "@heroicons/react/20/solid";
import { type Room } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type RoomInterface = Room & {};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "room");

export const RoomConfig: ModelConfig<RoomInterface> = {
  title: "Rooms",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const rooms = await prisma.room.findMany({});

    return rooms.map((t) => ({
      ...t,
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: ["name"],
    }),

  onEdit: (props) => prismaCrudHandler.update({ ...props, fields: ["name"] }),

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Room",
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
      ],
    },
    AddForm: {
      title: "Room",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "name",
          label: "Room Name",
        },
      ],
    },
  },
};
