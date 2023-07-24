import { CogIcon } from "@heroicons/react/20/solid";
import { type Contact } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PARENT_BASE_KEY } from "../utils/helpers";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";

export type ContactInterface = Contact & {};

const prismaCrudHandler = new PrismaCrudHandler(prisma, "contact");

export const ContactConfig: ModelConfig<ContactInterface> = {
  title: "Contacts",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const contacts = await prisma.contact.findMany({});

    return contacts.map((t) => ({
      ...t,
    }));
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: ["first_name", "last_name", "email", "phone"],
    }),

  onEdit: (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: ["first_name", "last_name", "email", "phone"],
    }),

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Contact",
  view: {
    navigation: {
      icon: CogIcon,
    },
    table: {
      columns: [
        {
          accessorKey: "first_name",
          header: "First Name",
        },
        {
          accessorKey: "last_name",
          header: "Last Name",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "phone",
          header: "Phone",
        },
      ],
    },
    AddForm: {
      title: "Contact",
      fields: [
        {
          Component: Form.DefaultInput,
          name: "first_name",
          label: "First Name",
          required: true,
        },
        {
          Component: Form.DefaultInput,
          name: "last_name",
          label: "Last Name",
          required: true,
        },
        {
          Component: Form.DefaultInput,
          name: "email",
          label: "Email",
          required: true,
          type: "email",
        },
        {
          Component: Form.DefaultInput,
          name: "phone",
          label: "Phone",
          required: true,
          type: "tel",
        },
        {
          Component: Form.DefaultInput,
          name: "address_1",
          label: "Address",
        },
        {
          Component: Form.DefaultInput,
          name: "city",
          label: "City",
        },
        {
          Component: Form.DefaultInput,
          name: "postcode",
          label: "Postcode",
        },
      ],
    },
  },
};
