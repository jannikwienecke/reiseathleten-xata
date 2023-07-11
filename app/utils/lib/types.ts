type Dict = {
  [key: string]: string | number | boolean | undefined | null;
} & {
  id: string | number;
};

export type GetOptionsFunction = (query: string) => Promise<
  {
    name: string;
    id: string | number;
    color?: string;
  }[]
>;

export type ModelConfig<T extends Dict = { id: number }> = {
  title: string;
  loader: (args: LoaderFunctionArgs) => Promise<T[]>;
  onDelete: (args: ActionFunctionArgs) => Promise<unknown>;
  onBulkDelete?: (args: ActionFunctionArgs) => Promise<unknown>;
  onAdd: (args: ActionFunctionArgs) => Promise<unknown>;
  onEdit: (args: ActionFunctionArgs) => Promise<unknown>;
  redirect: string;
  view: {
    table: {
      columns: {
        accessorKey: keyof T;
        header: string;
        isColor?: boolean;
      }[];
    };
    AddForm: {
      title: string;
      description?: string;
      fields:
        | ({
            Component: React.ComponentType<any>;
            selectField?: {
              fieldId: keyof T;
            };
            name: keyof T;
            label: string;
            onGetOptions?: GetOptionsFunction;
          } & React.HTMLProps<HTMLInputElement>)[];
    };
  };
};

export type ConfigType = {
  models: {
    [key: string]: ModelConfig<any>;
  };
};

export type DataFunctionArgs = {
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
  data: Dict[];
}

export interface LibActionData {
  status: number;
  message: string;
  field?: string;
  fieldMessage?: string;
}
