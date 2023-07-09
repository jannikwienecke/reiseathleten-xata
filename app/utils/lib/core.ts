export type ModelConfig = {
  title: string;
  loader: (args: LoaderFunctionArgs) => Promise<any>;
  onDelete: (args: ActionFunctionArgs) => Promise<any>;
  onBulkDelete?: (args: ActionFunctionArgs) => Promise<any>;
  onAdd: (args: ActionFunctionArgs) => Promise<any>;
  redirect: string;
  view: {
    table: {
      columns: {
        accessorKey: string;
        header: string;
        isColor?: boolean;
      }[];
    };
    AddForm: {
      fields:
        | ({
            Component: React.ComponentType<any>;
            name: string;
            label: string;
            onGetOptions?: (query: string) => Promise<
              {
                name: string;
                id: string;
                color?: string;
              }[]
            >;
          } & React.HTMLProps<HTMLInputElement>)[];
    };
  };
};

export type ConfigType = {
  models: {
    [key: string]: ModelConfig;
  };
};

export const getFormDataValue = (
  formData: FormData | undefined,
  key: string
) => {
  if (!formData) throw new Error("Form data is required");

  const val = formData.get(key);

  return val?.toString();
};

type DataFunctionArgs = {
  request: Request;
  params: Record<string, string>;
};
export type ActionFunctionArgs = DataFunctionArgs & {
  formData: FormData | undefined;
  config: ModelConfig;
};

export type LoaderFunctionArgs = DataFunctionArgs;

export interface PageHandler {
  makeRequest: (props: ActionFunctionArgs) => Promise<any>;
}

export interface LibLoaderData {
  data: any[];
}

export interface LibActionData {
  status: number;
  message: string;
  field?: string;
  fieldMessage?: string;
}
export const createPageFunction = ({ config }: { config: ConfigType }) => {
  const loader = async (props: DataFunctionArgs): Promise<LibLoaderData> => {
    const modelConfig: ModelConfig =
      config["models"][props.params.model as keyof typeof config["models"]];

    return {
      data: await modelConfig.loader(props),
    };
  };

  const action = async (props: DataFunctionArgs) => {
    const formData = await props.request.formData();

    const modelConfig: ModelConfig =
      config["models"][props.params.model as keyof typeof config["models"]];

    //   get search Params
    const url = new URL(props.request.url);
    const searchParams = url.searchParams;
    const action = searchParams.get("action");
    const formAction = getFormDataValue(formData, "action");

    let actionToRun = modelConfig.onAdd;
    if (action === "edit") {
      actionToRun = modelConfig.onAdd;
    } else if (formAction === "delete") {
      actionToRun = modelConfig.onDelete;
    } else if (formAction === "bulkDelete" && modelConfig.onBulkDelete) {
      actionToRun = modelConfig.onBulkDelete;
    } else if (formAction === "bulkDelete" && !modelConfig.onBulkDelete) {
      throw new Error("Bulk delete is not supported");
    }

    try {
      return (
        (await actionToRun({
          ...props,
          formData,
          config: modelConfig,
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
      return errorReturn;
    }
  };

  return {
    loader,
    action,
  };
};
