import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import React, { useContext } from "react";
import { type Column } from "./components/table";
import { LibContext } from "./react";
import type {
  LibActionData,
  LibLoaderData,
  ModelConfig,
  NavigationItem,
  TableActionType,
  Tag,
} from "./types";
import { ComboboxItem } from "~/components/command-bar";

export const useModels = ({
  models,
}: {
  models: {
    [key: string]: ModelConfig<any>;
  };
}) => {
  const customViews = [
    {
      viewName: "NewOrderSpecial",
      baseView: "NewOrder",
      tags: ["test"],
      title: "New Orders2",
    },
  ];

  const findView = (viewName: string) => {
    return Object.entries(models).find(([key, value]) => {
      return key === viewName;
    })?.[1];
  };

  const customModels = customViews.reduce(
    (acc, view) => {
      const modelConfig = findView(view.baseView);

      if (!modelConfig) {
        throw new Error(`View ${view.baseView} not found`);
      }

      return {
        ...acc,
        [view.baseView]: {
          ...modelConfig,
          title: view.title,
          customName: view.viewName,
        },
      };
    },
    {} as {
      [key: string]: ModelConfig<any>;
    }
  );

  const modelList = [
    ...Object.entries(models),
    ...Object.entries(customModels),
  ];

  return {
    modelList,
  };
};

export const useModel = (options?: { model?: string }) => {
  const { config } = useContext(LibContext);
  const { model: modelFromOptions } = options || {};

  const models = useModels({ models: config.models });

  if (!config.models) {
    throw new Error("Please Provide the config in the LibProvider");
  }

  const { model: modelFromParams } = useParams<{
    model: string;
  }>();

  const [searchParams] = useSearchParams();
  const customView = searchParams.get("view");

  const model = modelFromOptions || modelFromParams;

  // invariant(model, "Model is required");

  const modelConfig = config.models[model as keyof typeof config["models"]] as
    | ModelConfig
    | undefined;

  const getColumns = () => {
    return modelConfig?.view?.table?.columns || [];
  };

  const pageTitle = modelConfig?.title;
  const pageSubtitle = modelConfig?.description;
  const supportsBulkDelete = modelConfig?.onBulkDelete !== undefined;
  const supportsDetailView = modelConfig?.view.detail !== undefined;
  const supportsAdd = modelConfig?.onAdd !== undefined;
  const supportsEdit = modelConfig?.onEdit !== undefined;
  const supportsDelete = modelConfig?.onDelete !== undefined;
  const supportsSearch = modelConfig?.useAdvancedSearch === true;
  const supportsTags = true;
  const supportsSelectColumn = true;

  return {
    getColumns,
    pageTitle,
    pageSubtitle,
    addForm: modelConfig?.view.AddForm,
    supportsBulkDelete,
    supportsDetailView,
    supportsAdd,
    supportsEdit,
    supportsDelete,
    supportsSearch,
    supportsSelectColumn,
    supportsTags,
    customView,
    model,
    ...config,
    ...modelConfig,
    ...models,
  };
};

export const useAdminPage = (options?: { model?: string }) => {
  const model = useModel(options);
  const navigate = useNavigate();

  const { data: loaderData } = useLoaderData<LibLoaderData>() || {};
  const { items, columns, tags } = loaderData || {};

  const tagsCombobox = useTagsCombobox({
    onUpdateTags: (props) => handleUpdateTagsRef.current(props),
    items: items || [],
  });

  const commandbar = useCommandbar({ tagsCombobox, tags });

  const actionData = useActionData<LibActionData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigationState = useNavigation();
  const id = searchParams.get("id");
  const singleItem = items?.find?.(
    (item: any) => item.id.toString() === id?.toString()
  );

  const currentFormAction = navigationState.formData?.get("action");
  const dataItemDeleted = navigationState.formData?.get("id");
  const dataItemsDeleted = navigationState.formData
    ? JSON.parse(navigationState.formData?.get("ids")?.toString() || "[]")
    : undefined;

  const isSubmitting = navigationState.state === "submitting";
  const isRunningCutomAction =
    currentFormAction === "custom_action" && isSubmitting;

  const isUpdatingColumns =
    currentFormAction === "selectColumns" && navigationState.state !== "idle";

  const columnIdsString = navigationState.formData?.get("ids") as string | null;
  const columnIds = columnIdsString ? JSON.parse(columnIdsString) : null;

  const handleClickEdit = (dataItem: any) => {
    searchParams.set("action", "edit");
    searchParams.set("id", dataItem.id);

    setSearchParams(searchParams);
  };

  const handelClickAdd = () => {
    searchParams.set("action", "create");
    setSearchParams(searchParams);
  };

  const updateSearchParamsWithQuery = (query: string) => {
    searchParams.set("query", query);
    setSearchParams(searchParams);
  };

  const handleSearchChange = (query: string) => {
    if (query === "") {
      searchParams.delete("query");
      setSearchParams(searchParams);
      return;
    } else {
      debounce(() => updateSearchParamsWithQuery(query), 300)();
    }
  };

  const handleSortChange = (column: Column<any>) => {
    const sortByField = searchParams.get("sortField");
    const sortByDirection = searchParams.get("sortDirection");

    searchParams.set("sortField", column.accessorKey as string);
    searchParams.set(
      "sortDirection",
      sortByField === column.accessorKey && sortByDirection === "asc"
        ? "desc"
        : "asc"
    );

    setSearchParams(searchParams);
  };

  const debounce = (func: any, wait: number) => {
    let timeout: any;
    return function executedFunction(...args: any) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleSelectColumns = (newColumns: Column<any>[]) => {
    submit(
      {
        ids: JSON.stringify(newColumns.map((item) => item.accessorKey)),
        action: "selectColumns",
        model: model.model || "",
      },
      {
        method: "POST",
      }
    );
  };

  const updateTagsInDb = ({
    newTags,
    deletedTags,
    id,
  }: {
    newTags: Tag[];
    deletedTags: Tag[];
    id: string | number;
  }) => {
    submit(
      {
        newTags: JSON.stringify(newTags),
        deletedTags: JSON.stringify(deletedTags),
        id: id.toString(),
        action: "updateTags",

        model: model.model || "",
      },
      {
        method: "POST",
      }
    );
  };

  const showTagsRef = React.useRef(commandbar.showTags);

  React.useEffect(() => {
    showTagsRef.current = commandbar.showTags;
  }, [commandbar.showTags]);

  // same for tagsRef

  const tagsRef = React.useRef(tags);
  React.useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  const handleUpdateTags = ({
    newTags,
    deletedTags,
    id,
  }: {
    newTags: Tag[];
    deletedTags: Tag[];
    id: string | number;
  }) => {
    if (showTagsRef.current) {
      if (deletedTags.length === 0 && newTags.length === 0) return;

      const allWithoutDeletedTags = tagsRef.current.filter((tag) => {
        return !deletedTags.find((t) => t.label === tag.label);
      });

      submit(
        {
          tags: JSON.stringify([...allWithoutDeletedTags, ...newTags]),
          action: "updateTagsOfView",
          model: model.model || "",
        },
        {
          method: "POST",
        }
      );
    } else {
      updateTagsInDb({
        newTags,
        deletedTags,
        id,
      });
    }
  };
  const handleUpdateTagsRef = React.useRef(handleUpdateTags);

  const handelClickDelete = (dataItem: any) => {
    submit(
      {
        id: dataItem.id,
        action: "delete",
        model: model.model || "",
      },
      {
        method: "POST",
      }
    );
  };

  const handleClickBulkDelete = (dataItems: any[]) => {
    submit(
      {
        ids: JSON.stringify(dataItems.map((item) => item.id)),
        action: "bulkDelete",
        model: model.model || "",
      },
      {
        method: "POST",
      }
    );
  };

  const handleClickDetailView = (dataItem: any) => {
    const url = model.view?.detail?.getUrl?.(dataItem.id);

    navigate(url || `${dataItem.id}/detail`);
  };

  const dataListToRender = (
    items?.filter((data: any) => {
      return (
        data.id !== dataItemDeleted && !dataItemsDeleted?.includes(data.id)
      );
    }) || []
  ).map((dataItem: any) => {
    return dataItem;
  });

  const getOverlayProps = () => {
    return {
      isOpen:
        searchParams.get("action") === "create" ||
        searchParams.get("action") === "edit",
      onCancel: () => {
        searchParams.delete("action");
        searchParams.delete("id");
        setSearchParams(searchParams);
      },
    };
  };

  const getFormProps = () => {
    return {
      title: model.addForm?.title || "",
      model: model.model,
      onCancel: () => {
        searchParams.delete("action");
        searchParams.delete("id");
        setSearchParams(searchParams);
      },
      error: {
        message: actionData?.fieldMessage,
        field: actionData?.field,
      },
    };
  };

  const getFormFieldProps = (field: React.HTMLProps<HTMLInputElement>) => {
    const isCreating = searchParams.get("action") === "create";
    const isEditing = searchParams.get("action") === "edit";
    const isSubmitting = actionState === "loading";

    const fieldModel = model.addForm?.fields.find((f) => f.name === field.name);

    let fieldDefaultValue: any = "";

    if (isEditing && singleItem) {
      fieldDefaultValue = singleItem[field.name || ""];
    }

    // to get the id of the connected model
    const selectId =
      singleItem?.[(fieldModel?.selectField?.fieldId as string) || "id"];

    const _defaultValue =
      fieldModel?.formatValue?.(fieldDefaultValue) || fieldDefaultValue;
    return {
      ...field,
      selectId,
      model: model.model,
      key: field.name,
      value: isCreating && isSubmitting ? "" : field?.value || _defaultValue,
      error:
        actionData?.field === field.name
          ? actionData?.fieldMessage || ""
          : undefined,
    };
  };

  const actionState = navigationState.state;

  const [closedNotification, setClosedNotification] = React.useState(false);

  React.useEffect(() => {
    if (actionState === "submitting") {
      setClosedNotification(false);
    }
  }, [actionState]);

  const getNotificationProps = React.useCallback(() => {
    const isOpen = closedNotification ? false : !!actionData?.message;
    return {
      isOpen,
      key: isOpen ? "open" : "close",
      message: "Something went wrong",
      subMessage: actionData?.message,
      isError: true,
      onClose: () => {
        setClosedNotification(true);
      },
    };
  }, [actionData?.message, closedNotification]);

  const getLayoutProps = () => {
    const itemsWithoutParent: NavigationItem[] = [];
    const itemsWithParent: NavigationItem[] = [];

    model.modelList.forEach(([key, value]) => {
      const item = {
        parent: value.parent,
        label: value.title,
        icon: value.view?.navigation?.icon,
        name: value.customName ? `${key}?view=${value.customName}` : key,
        // isCurrent: key === model.model,
        isCurrent: model.customView
          ? value.customName === model.customView
          : key === model.model && !value.customName,
      };

      if (value.parent) {
        itemsWithParent.push(item);
      } else {
        itemsWithoutParent.push(item);
      }
    });

    return {
      items: [...itemsWithoutParent, ...itemsWithParent].sort((a, b) => {
        // sort by parent name
        if (a.parent && b.parent) {
          return a.parent.localeCompare(b.parent);
        }

        return 0;
      }),
    };
  };

  const onClickAction = (action: TableActionType<any>, dataItems: any[]) => {
    submit(
      {
        ids: JSON.stringify(dataItems.map((item) => item.id)),
        action: "custom_action",
        actionName: action.name,
        model: model.model || "",
      },
      {
        method: "POST",
      }
    );
  };

  const actions = model.actions || [];

  const allColumns = model.getColumns();

  const selectedColumns_ = columns
    ? isUpdatingColumns
      ? allColumns.filter((column) => {
          return columnIds?.includes(column.accessorKey);
        })
      : allColumns.filter((column) => {
          return columns
            .map((c) => c.accessorKey)
            ?.includes(column.accessorKey);
        })
    : [];

  return {
    tagsCombobox,
    commandbar,
    columns: allColumns,
    selectedColumns: selectedColumns_,
    optimisicData: dataListToRender,
    data: items,
    handelClickAdd: model.supportsAdd ? handelClickAdd : undefined,
    handleClickEdit: model.supportsEdit ? handleClickEdit : undefined,
    handelClickDelete: model.supportsDelete ? handelClickDelete : undefined,
    handleClickBulkDelete: model.supportsBulkDelete
      ? handleClickBulkDelete
      : undefined,
    handleClickDetailView: model.supportsDetailView
      ? handleClickDetailView
      : undefined,
    handleSearchChange: model.supportsSearch ? handleSearchChange : undefined,
    handleSortChange: model.supportsSearch ? handleSortChange : undefined,
    handleSelectColumns: model.supportsSelectColumn
      ? handleSelectColumns
      : undefined,
    currentData: singleItem,
    getOverlayProps,
    getFormProps,
    getFormFieldProps,
    getNotificationProps,
    getLayoutProps,
    actions,
    onClickAction,
    isRunningCutomAction,
    tags,
    ...model,
  };
};

export const useCommandbar = ({
  tagsCombobox,
  tags,
}: {
  tagsCombobox: ReturnType<typeof useTagsCombobox>;
  tags: Tag[];
}) => {
  const [showTags, setShowTags] = React.useState(false);
  const [commandbarIsOpen, setCommandbarIsOpen] = React.useState(false);

  React.useEffect(() => {
    setCommandbarIsOpen((prev) => {
      return tagsCombobox.isOpen !== prev ? tagsCombobox.isOpen : prev;
    });
  }, [tagsCombobox.isOpen]);

  const items: ComboboxItem[] = [
    {
      label: "New",
      id: 1,
    },
    {
      label: "Filter by tags",
      id: 2,
    },
  ];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "k" && event.metaKey) {
      setCommandbarIsOpen(true);
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onClose = () => {
    setCommandbarIsOpen(false);
    tagsCombobox.onClose();
    setShowTags(false);
  };

  const onSelect = (item: ComboboxItem) => {
    if (item.id === 2) {
      setShowTags(true);
      tagsCombobox.open({ tags });
    } else {
      setShowTags(false);
      onClose();
    }
  };

  const handleClickTags = () => {
    setShowTags(true);
    tagsCombobox.open({ tags });
  };

  return {
    items,
    isOpen: commandbarIsOpen,
    tagsCombobox,
    onClose,
    onSelect,
    showTags,
    handleClickTags,
  };
};

export const useTagsCombobox = ({
  items,
  onUpdateTags,
}: {
  items: any[];
  onUpdateTags: (options: {
    newTags: Tag[];
    deletedTags: Tag[];
    id: number | string;
  }) => void;
}) => {
  const [selected, setSelected] = React.useState<Tag[]>([]);
  const [commandBar, setCommandBar] = React.useState<{
    all: Tag[];
    selected: Tag[];
    dataItem?: Record<string, any>;
  }>();

  const handleCloseCommandBar = () => {
    const newTags =
      selected.filter((tag) => {
        return !commandBar?.selected.find((t) => t.label === tag.label);
      }) || [];

    const deletedTags =
      commandBar?.selected.filter((tag) => {
        return !selected.find((t) => t.label === tag.label);
      }) || [];

    const id = commandBar?.dataItem?.id as string | number;

    onUpdateTags?.({
      newTags,
      deletedTags,
      id,
    });

    setCommandBar(undefined);
    setSelected([]);
  };

  const onChange = (selected: Tag[]) => {
    setSelected(selected);
  };

  const allTags = items
    .map((dataItem) => {
      return dataItem["tags"];
    })
    .flat() as Tag[];

  const labels = Array.from(new Set(allTags.map((t) => t.label)));

  const all = labels.map(
    (label) => allTags.find((t) => t.label === label) as Tag
  );

  const handleClickOnTag = ({
    col,
    tags,
    dataItem,
  }: {
    col: Column<any>;
    tags: Tag[];
    dataItem: Record<string, any>;
  }) => {
    setCommandBar({
      all,
      selected: tags,
      dataItem: dataItem,
    });
  };

  const open = ({ tags }: { tags: Tag[] }) => {
    setCommandBar({
      all,
      selected: tags,
      dataItem: undefined,
    });
  };

  return {
    isOpen: !!commandBar,
    selected: commandBar?.selected || [],
    tags: commandBar?.all || [],
    onClose: handleCloseCommandBar,
    onChange,
    handleClickOnTag,

    open,
  };
};
