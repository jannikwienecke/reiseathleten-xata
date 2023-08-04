import { request } from "@playwright/test";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { isLoggedIn } from "../helper";
import type {
  ModelConfig,
  ConfigType,
  LibActionData,
  LibLoaderData,
  DataFunctionArgs,
  ActionFunctionArgs,
} from "./types";

export const getFormDataValue = (
  formData: FormData | undefined,
  key: string
) => {
  if (!formData) throw new Error("Form data is required");

  const val = formData.get(key);

  return val?.toString();
};

export const createPageFunction = ({
  config,
  ...args
}: {
  config: ConfigType;
}) => {
  const loader = async (props: DataFunctionArgs): Promise<LibLoaderData> => {
    const modelConfig: ModelConfig =
      config["models"][props.params.model as keyof typeof config["models"]];

    const query = new URL(props.request.url).searchParams.get("query") || "";

    const sortByField = new URL(props.request.url).searchParams.get(
      "sortField"
    );

    const sortByDirection = new URL(props.request.url).searchParams.get(
      "sortDirection"
    );

    if (!modelConfig) {
      throw new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }

    const user = await isLoggedIn(props.request);

    invariant(user, "user is required");

    const view = await prisma.viewColumns.findFirst({
      where: {
        user_id: user.props.id,
        modelName: props.params.model,
      },
    });

    const columnIds = view?.columnIds ? JSON.parse(view?.columnIds) : [];

    const allColumns = modelConfig.view.table.columns;
    const columns = allColumns.filter((column) =>
      columnIds.includes(column.accessorKey)
    );

    const items = await modelConfig.loader({
      ...props,
      query: query.toLowerCase(),
      sortBy:
        sortByField && sortByDirection
          ? {
              field: sortByField,
              direction: sortByDirection as "asc" | "desc",
            }
          : undefined,
    });

    return {
      data: {
        columns,
        items,
      },
    };
  };

  const action = async (props: DataFunctionArgs) => {
    const onSelectColumns = async ({
      formData,
      request,
    }: ActionFunctionArgs) => {
      const user = await isLoggedIn(request);

      const ids = getFormDataValue(formData, "ids");
      const model = getFormDataValue(formData, "model");

      invariant(ids, "ids is required");
      invariant(model, "model is required");
      invariant(user, "user is required");

      const viewColumns = await prisma.viewColumns.findFirst({
        where: {
          modelName: model,
          User: {
            id: user.props.id,
          },
        },
      });

      if (viewColumns) {
        await prisma.viewColumns.update({
          where: {
            id: viewColumns.id,
          },
          data: {
            columnIds: ids,
          },
        });
        return;
      } else {
        await prisma.viewColumns.create({
          data: {
            modelName: model,
            columnIds: ids,
            User: {
              connect: {
                id: user.props.id,
              },
            },
          },
        });
      }
    };

    const formData = await props.request.formData();

    const formAction = getFormDataValue(formData, "action");
    const customActionName = getFormDataValue(formData, "actionName");
    const model = getFormDataValue(formData, "model");
    const query = new URL(props.request.url).searchParams.get("query") || "";

    const modelConfig: ModelConfig =
      config["models"][model as keyof typeof config["models"]];

    //   get search Params
    const url = new URL(props.request.url);
    const searchParams = url.searchParams;
    const action = searchParams.get("action");

    let actionToRun = modelConfig?.onAdd;
    if (action === "edit") {
      actionToRun = modelConfig.onEdit;
    } else if (formAction === "delete") {
      actionToRun = modelConfig.onDelete;
    } else if (formAction === "bulkDelete" && modelConfig.onBulkDelete) {
      actionToRun = modelConfig.onBulkDelete;
    } else if (formAction === "bulkDelete" && !modelConfig.onBulkDelete) {
      throw new Error("Bulk delete is not supported");
    } else if (formAction === "selectColumns") {
      actionToRun = onSelectColumns;
    } else if (formAction === "custom_action") {
      const customActionToRu = modelConfig.actions?.find(
        (action) => action.name === customActionName
      );

      if (!customActionToRu) {
        throw new Error(`Custom action ${customActionName} not found`);
      } else {
        actionToRun = customActionToRu.handler;
      }
    }

    try {
      return (
        (await actionToRun?.({
          ...props,
          formData,
          config: modelConfig,
          query: query.toLowerCase(),
        })) || {}
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error.message as string)
          : "Something went wrong";

      const errorReturn: LibActionData = {
        status: 500,
        message,
        ...(error as {}),
      };
      console.log("-----ERROR-----");
      console.log(errorReturn);
      console.log(" ");

      return errorReturn;
    }
  };

  return {
    loader,
    action,
  };
};
