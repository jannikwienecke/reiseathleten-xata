import type {
  ModelConfig,
  ConfigType,
  LibActionData,
  LibLoaderData,
  DataFunctionArgs,
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

    if (!modelConfig) {
      throw new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }

    return {
      data: await modelConfig.loader({
        ...props,
        query: query.toLowerCase(),
      }),
    };
  };

  const action = async (props: DataFunctionArgs) => {
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
