import { UserIcon } from "@heroicons/react/20/solid";
import type { Customer } from "@prisma/client";
import { Form } from "~/components";
import { prisma } from "~/db.server";

import type { ModelConfig } from "~/utils/lib/types";
import { PrismaCrudHandler } from "../utils/prisma-crud-handler";
import { PARENT_BASE_KEY } from "../utils/helpers";

const prismaCrudHandler = new PrismaCrudHandler(prisma, "customer");

export type CustomerInterface = Customer & {};

export const CustomerConfig: ModelConfig<CustomerInterface> = {
  title: "Customers",
  parent: PARENT_BASE_KEY,
  loader: async () => {
    const customers = await prisma.customer.findMany({});

    return customers;
  },

  onDelete: (props) => prismaCrudHandler.delete(props),

  onAdd: (props) =>
    prismaCrudHandler.add({
      ...props,
      fields: [
        "name",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "zip",
        "country",
      ],
    }),

  onEdit: (props) =>
    prismaCrudHandler.update({
      ...props,
      fields: [
        "name",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "zip",
        "country",
      ],
    }),

  onBulkDelete: (props) => prismaCrudHandler.bulkDelete(props),

  redirect: "/admin/Customer",

  view: {
    navigation: {
      icon: UserIcon,
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
        {
          accessorKey: "address_1",
          header: "Address 1",
        },
        {
          accessorKey: "address_2",
          header: "Address 2",
        },
        {
          accessorKey: "city",
          header: "City",
        },
        {
          accessorKey: "state",
          header: "State",
        },
        {
          accessorKey: "postcode",
          header: "Zip",
        },
      ],
    },
    AddForm: {
      title: "Tag",
      fields: [
        {
          name: "first_name",
          label: "First Name",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "last_name",
          label: "Last Name",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "phone",
          label: "Phone",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "country",
          label: "Country",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "company",
          label: "Company",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "address_1",
          label: "Address 1",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
        {
          name: "address_2",
          label: "Address 2",
          type: "text",
          required: true,
          Component: Form.DefaultInput,
        },
      ],
    },
  },
};
