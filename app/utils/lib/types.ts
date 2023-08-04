export type Dict = {
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | Date
    | {
        label: string;
        color: string;
      }[];
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

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  isColor?: boolean;
  formatValue?: (value: any) => any;
  disableSortBy?: boolean;
}

export type ModelConfig<T extends Dict = { id: number }> = {
  title: string;
  description?: string;
  loader: (args: LoaderFunctionArgs) => Promise<T[]>;
  onDelete?: (args: ActionFunctionArgs) => Promise<unknown>;
  onBulkDelete?: (args: ActionFunctionArgs) => Promise<unknown>;
  onAdd?: (args: ActionFunctionArgs) => Promise<unknown>;
  onEdit?: (args: ActionFunctionArgs) => Promise<unknown>;
  useAdvancedSearch?: boolean;
  redirect: string;
  parent?: string;
  view: {
    table: {
      getColumns?: (args: DataFunctionArgs) => Promise<string[]>;
      columns: Column<T>[];
    };
    detail?: {
      getUrl?: (id: string | number) => string;
    };
    navigation: {
      icon: React.ComponentType<any>;
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
            formatValue?: (value: any) => any;
          } & React.HTMLProps<HTMLInputElement>)[];
    };
  };
  actions?: TableActionType<T>[];
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
  query?: string;
  formData: FormData | undefined;
  config: ModelConfig;
};

export type LoaderFunctionArgs = {
  query?: string;
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
} & DataFunctionArgs;

export interface PageHandler {
  makeRequest: (props: ActionFunctionArgs) => Promise<any>;
}

export interface LibLoaderData {
  data: {
    items: Dict[];
    columns: {
      accessorKey: string;
      header: string;
    }[];
  };
}

export interface LibActionData {
  status: number;
  message: string;
  field?: string;
  fieldMessage?: string;
}

export interface NavigationItem {
  parent?: string;
  label: string;
  name: string;
  icon: React.ComponentType<any>;
  isCurrent: boolean;
}

export interface TableActionType<T> {
  name: string;
  label: string;
  handler: (args: DataFunctionArgs) => Promise<unknown>;
}

export interface Tag {
  label: string;
  color: string;
}
