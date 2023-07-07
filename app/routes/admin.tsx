import { Outlet } from "@remix-run/react";

import {
  ActionFunctionArgs,
  ConfigType,
  LoaderFunctionArgs,
  getFormDataValue,
} from "~/utils/lib/core";
// import { getXataClient } from "~/utils/xata";
// import { getXataClient } from "utils/xata";
import { Form } from "~/components/form";
import { getXataClient } from "utils/xata";

export const CONFIG: ConfigType = {
  models: {
    Location: {
      title: "Locations",
      loader: async ({ request }: LoaderFunctionArgs) => {
        const client = getXataClient();
        return await client.db.Location.getAll();
      },
      onAdd: async ({ formData }: ActionFunctionArgs) => {
        const client = await getXataClient();

        try {
          return await client.db.Location.create({
            name: getFormDataValue(formData, "name"),
            description: getFormDataValue(formData, "description"),
          });
        } catch (e: any) {
          console.log(e);

          throw {
            message: e.message,
            status: e.status,
            field: "name",
            fieldMessage: "Name already exists",
          };
        }
      },

      onDelete: async ({ formData, params }: ActionFunctionArgs) => {
        const client = await getXataClient();

        await client.db.Location.deleteOrThrow({
          id: getFormDataValue(formData, "id") || "",
        });
      },

      onBulkDelete: async ({ formData }: ActionFunctionArgs) => {
        const client = await getXataClient();

        const idsToDelete = JSON.parse(
          getFormDataValue(formData, "ids") || "[]"
        ) as string[];

        const promises = idsToDelete.map((id) =>
          client.db.Location.delete({ id })
        );
        await Promise.all(promises);
      },

      redirect: "/admin/Location",
      view: {
        table: {
          columns: [
            {
              accessorKey: "name",
              header: "name",
            },
          ],
        },
        AddForm: {
          fields: [
            {
              Component: Form.DefaultInput,
              name: "name",
              label: "name",
              minLength: 3,
            },
          ],
        },
      },
    },

    Tag: {
      title: "Tags",
      loader: async (props: LoaderFunctionArgs) => {
        const client = await getXataClient();
        const tag = await client.db.Tag.select([
          "label",
          "id",
          "color.name",
        ]).getAll();

        return tag.map((t) => ({
          ...t,
          color: t.color?.name || "",
        }));
      },

      onDelete: async ({ formData }: ActionFunctionArgs) => {
        const client = await getXataClient();
        return await client.db.Tag.delete({
          id: getFormDataValue(formData, "id") || "",
        });
      },

      onAdd: async ({ formData }: ActionFunctionArgs) => {
        const client = await getXataClient();

        return await client.db.Tag.create({
          label: getFormDataValue(formData, "label"),
          color: getFormDataValue(formData, "color"),
        });
      },

      redirect: "/admin/Tag",
      view: {
        table: {
          columns: [
            {
              accessorKey: "label",
              header: "Label",
            },
            {
              accessorKey: "color",
              header: "Color",
              isColor: true,
            },
          ],
        },
        AddForm: {
          fields: [
            {
              Component: Form.DefaultInput,
              name: "label",
              label: "Label",
              minLength: 4,
            },
            {
              name: "color",
              label: "Color",
              Component: Form.Select,
              onGetOptions: async (query) => {
                const client = await getXataClient();
                const records = await client.search.byTable(query, {
                  tables: [
                    {
                      table: "Color",
                      target: [{ column: "name" }],
                    },
                  ],
                  fuzziness: 1,
                  prefix: "phrase",
                });

                return (
                  records.Color?.filter((r) => r.id && r.name)?.map((r) => {
                    return {
                      name: r.name || "",
                      color: r.name || "",
                      id: r.id || "",
                    };
                  }) || []
                );
              },
            },
          ],
        },
      },
    },
  },
};

export default function Index() {
  return <Outlet />;
}

// export default function Index() {
//   return <>123</>;
// }
