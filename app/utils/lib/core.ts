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
import { DMMF } from "@prisma/client/runtime";
import { type CustomView, Prisma } from "@prisma/client";

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

  const getSidebarConfig = async ({
    request,
    customViews,
  }: DataFunctionArgs & {
    customViews: CustomView[];
  }) => {
    const sidebar = await prisma.viewSidebar.findMany();
    const modelsToHide = sidebar
      .filter((v) => v.show === false)
      .map((v) => v.modelName);

    const modelsToShow = sidebar
      .filter((v) => v.show === true)
      .map((v) => v.modelName);

    let _hiddenCustomViews: string[] = [];
    const getNavigationItemsToShowInSidebar = () => {
      const customViewNames = customViews.map((v) => v.name);
      const models = Object.keys(config.models);

      const _modelsToShow = models.filter((model) => {
        if (modelsToHide.includes(model)) return false;
        else return true;
      });

      const _customViewsToShow = customViewNames.filter((view) => {
        if (modelsToShow.includes(view)) return true;
        else return false;
      });

      _hiddenCustomViews = customViewNames.filter((view) => {
        if (modelsToShow.includes(view)) return false;
        else return true;
      });

      return [..._modelsToShow, ..._customViewsToShow];
    };

    const toShow = getNavigationItemsToShowInSidebar();

    return {
      navigationItems: toShow,
      navigationItemsHidden: [...modelsToHide, ..._hiddenCustomViews],
    };
  };

  const loader = async (props: DataFunctionArgs): Promise<LibLoaderData> => {
    const customConfig = await getCustomConfig(props);
    const sidebarConfig = await getSidebarConfig({
      ...props,
      customViews: customConfig.views,
    });
    const customViews = customConfig.views;

    const url = new URL(props.request.url);
    const query = url.searchParams.get("query") || "";
    const customViewName = url.searchParams.get("view") || "";

    if (props.params.id) {
      return {
        data: {
          items: [],
          columns: [],
          tags: [],
          customViews,
          ...sidebarConfig,
        },
      };
    }

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
        ...sidebarConfig,
        columns,
        tags,
        items,
        customViews,
      },
    };
  };

  const action = async (props: DataFunctionArgs) => {
    const onCreateNewView = async ({
      formData,
      request,
      params,
    }: ActionFunctionArgs) => {
      const user = await isLoggedIn(request);

      const customViewTitle = getFormDataValue(formData, "title");
      const customViewName = getFormDataValue(formData, "name");
      const shouldCustomViewBeShownInNavigation = getFormDataValue(
        formData,
        "showInNavigation"
      );
      // NOT IN DB MODEL YET
      const description = getFormDataValue(formData, "description");

      const model = params.model;

      invariant(user, "User must be logged in");
      invariant(model, "model must be defined");
      invariant(customViewTitle, "title must be defined");
      invariant(customViewName, "name must be defined");
      invariant(
        shouldCustomViewBeShownInNavigation !== undefined,
        "showInSidebar must be defined"
      );

      await prisma.customView.create({
        data: {
          name: customViewName,
          baseView: model,
          title: customViewTitle,
          User: {
            connect: {
              id: user.props.id,
            },
          },
        },
      });

      const tags = await prisma.viewTags.findFirst({
        where: {
          User: {
            id: user.props.id,
          },
          modelName: model,
        },
      });

      const columsn = await prisma.viewColumns.findFirst({
        where: {
          User: {
            id: user.props.id,
          },
          modelName: model,
        },
      });

      // create the tags and columns for the custom view
      tags?.tags &&
        (await prisma.viewTags.create({
          data: {
            User: {
              connect: {
                id: user.props.id,
              },
            },
            modelName: customViewName,
            tags: tags?.tags,
          },
        }));

      columsn?.columnIds &&
        (await prisma.viewColumns.create({
          data: {
            User: {
              connect: {
                id: user.props.id,
              },
            },
            modelName: customViewName,
            columnIds: columsn?.columnIds,
          },
        }));

      return {};
    };

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

    const onDeleteNavigationItem = async ({
      formData,
      request,
    }: ActionFunctionArgs) => {
      const user = await isLoggedIn(request);
      invariant(user, "user is required");

      const name = getFormDataValue(formData, "name") as string;

      // model name can be User or User?view=customViewName
      const customViewName = name.split("?view=")[1];
      const modelName = customViewName || name.split("?view=")[0];

      const _model = customViewName || modelName;

      await prisma.viewSidebar.create({
        data: {
          modelName: _model,
          show: false,
          User: {
            connect: {
              id: user.props.id,
            },
          },
        },
      });
    };

    const onAddNavigationItem = async ({
      formData,
      request,
    }: ActionFunctionArgs) => {
      const user = await isLoggedIn(request);
      invariant(user, "user is required");

      const name = getFormDataValue(formData, "name") as string;

      // model name can be User or User?view=customViewName
      const customViewName = name.split("?view=")[1];
      const modelName = customViewName || name.split("?view=")[0];

      const _model = customViewName || modelName;

      // has already? then update
      const existing = await prisma.viewSidebar.findFirst({
        where: {
          modelName: _model,
          User: {
            id: user.props.id,
          },
        },
      });

      if (existing) {
        await prisma.viewSidebar.update({
          where: {
            id: existing.id,
          },
          data: {
            show: true,
          },
        });
        return;
      } else {
        await prisma.viewSidebar.create({
          data: {
            modelName: _model,
            show: true,
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
    } else if (formAction === "updateTags") {
      actionToRun = onUpdateTags;
    } else if (formAction === "updateTagsOfView") {
      actionToRun = onUpdateTagsOfView;
    } else if (customActionName === "createCustomView") {
      actionToRun = onCreateNewView;
    } else if (formAction === "deleteNavigationItem") {
      actionToRun = onDeleteNavigationItem;
    } else if (formAction === "addNavigationItem") {
      actionToRun = onAddNavigationItem;
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
