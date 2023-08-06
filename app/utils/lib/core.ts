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
  Tag,
} from "./types";
import { getSchema, logger } from "@prisma/internals";
import { DMMF } from "@prisma/client/runtime";
import { Prisma } from "@prisma/client";

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
  const getCustomConfig = async ({ request }: DataFunctionArgs) => {
    const user = await isLoggedIn(request);
    invariant(user, "user is required");

    const views = await prisma.customView.findMany({
      where: {
        User: {
          id: user.props.id,
        },
      },
    });

    return {
      views,
    };
  };

  const loader = async (props: DataFunctionArgs): Promise<LibLoaderData> => {
    const customConfig = await getCustomConfig(props);
    const customViews = customConfig.views;

    const url = new URL(props.request.url);
    const query = url.searchParams.get("query") || "";
    const customViewName = url.searchParams.get("view") || "";

    const modelConfigNormal: ModelConfig =
      config["models"][props.params.model as keyof typeof config["models"]];

    const findView = (viewName: string) => {
      return Object.entries(config.models).find(([key, value]) => {
        return key === viewName;
      })?.[1];
    };
    const customView = customViews.find((v) => v.name === customViewName);

    const modelConfig = customView
      ? {
          ...findView(customView?.baseView),
          ...customView,
        }
      : modelConfigNormal;

    if (!modelConfig.loader) throw new Error("Loader is required");

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
        modelName: customView ? customView.name : props.params.model,
      },
    });

    // const x = Prisma.dmmf.datamodel.models.find((m) => m.name === "User");
    // console.log(x);

    // same for viewTags
    const viewTags = await prisma.viewTags.findFirst({
      where: {
        user_id: user.props.id,
        modelName: customView ? customView.name : props.params.model,
      },
    });

    const columnIds = view?.columnIds ? JSON.parse(view?.columnIds) : [];
    const tags: Tag[] = viewTags?.tags ? JSON.parse(viewTags?.tags) : [];

    const allColumns = modelConfig.view?.table.columns || [];

    const columns = allColumns.filter((column) =>
      columnIds.includes(column.accessorKey)
    );

    const items = await modelConfig.loader({
      ...props,
      query: query.toLowerCase(),
      tags,
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
        tags,
        items,
        customViews,
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

      const customViewName = url.searchParams.get("view") || "";

      invariant(ids, "ids is required");
      invariant(model, "model is required");
      invariant(user, "user is required");

      const viewColumns = await prisma.viewColumns.findFirst({
        where: {
          modelName: customViewName || model,
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
            modelName: customViewName || model,
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

    const onUpdateTags = async ({ formData, request }: ActionFunctionArgs) => {
      const newTags = getFormDataValue(formData, "newTags") as string;
      const deletedTags = getFormDataValue(formData, "deletedTags") as string;
      const orderId = getFormDataValue(formData, "id") as string;

      invariant(typeof newTags === "string", "newTags is required");
      invariant(typeof deletedTags === "string", "deletedTags is required");
      invariant(typeof orderId === "string", "orderId is required");

      const _newTags = JSON.parse(newTags) as Tag[];
      const _deletedTags = JSON.parse(deletedTags) as Tag[];

      await prisma.orderTag.createMany({
        data: _newTags.map((tag: any) => ({
          color: tag.color,
          label: tag.label,
          orderId: +orderId,
        })),
      });

      await prisma.orderTag.deleteMany({
        where: {
          label: {
            in: _deletedTags.map((tag) => tag.label),
          },
          orderId: +orderId,
        },
      });
    };

    const onUpdateTagsOfView = async ({
      formData,
      request,
    }: ActionFunctionArgs) => {
      const tags = getFormDataValue(formData, "tags") as string;
      const user = await isLoggedIn(request);

      const customViewName = url.searchParams.get("view") || "";

      invariant(typeof tags === "string", "tags is required");
      invariant(user, "user is required");

      const _tags = JSON.parse(tags) as Tag[];

      await prisma.viewTags.deleteMany({
        where: {
          modelName: customViewName || props.params.model,
          user_id: user.props.id,
        },
      });

      await prisma.viewTags.create({
        data: {
          tags: JSON.stringify(_tags),
          modelName: customViewName || props.params.model,

          User: {
            connect: {
              id: user.props.id,
            },
          },
        },
      });
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
    } else if (formAction === "updateTags") {
      actionToRun = onUpdateTags;
    } else if (formAction === "updateTagsOfView") {
      actionToRun = onUpdateTagsOfView;
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
