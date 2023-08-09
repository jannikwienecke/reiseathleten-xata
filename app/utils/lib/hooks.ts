import { CustomView } from "@prisma/client";
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
import React from "react";
import {
  ComboboxItem,
  CommandbarConfig,
  CommandbarFormItem,
} from "~/components/command-bar";
import { type Column } from "./components/table";
import { useLibConfig } from "./react";
import type {
  LibActionData,
  LibLoaderData,
  ModelConfig,
  NavigationItem,
  TableActionType,
  Tag,
} from "./types";

export const useModels = ({
  models,
  customViews,
}: {
  models: {
    [key: string]: ModelConfig<any>;
  };
  customViews: CustomView[];
}) => {
  const [modelList, setModelList] = React.useState<
    [string, ModelConfig<any>][]
  >([]);

  const modelsRef = React.useRef(models);
  const customViewsRef = React.useRef(customViews);

  React.useEffect(() => {
    modelsRef.current = models;
    customViewsRef.current = customViews;
  }, [customViews, models]);

  React.useEffect(() => {
    const findView = (viewName: string) => {
      return Object.entries(modelsRef.current).find(([key, value]) => {
        return key === viewName;
      })?.[1];
    };

    const customModels = customViewsRef.current.reduce(
      (acc, view) => {
        const modelConfig = findView(view.baseView);

        if (!modelConfig) {
          throw new Error(`View ${view.baseView} not found`);
        }

        const name = `${view.baseView}?view=${view.name}`;
        return {
          ...acc,
          [name]: {
            ...modelConfig,
            title: view.title,
            customName: view.name,
          },
        };
      },
      {} as {
        [key: string]: ModelConfig<any>;
      }
    );

    const modelList = [
      ...Object.entries(modelsRef.current),
      ...Object.entries(customModels),
    ];

    setModelList(modelList);
  }, []);

  return {
    modelList,
  };
};

export const useModel = (options: {
  model?: string;
  customViews: CustomView[];
}) => {
  const config = useLibConfig();

  const { model: modelFromOptions } = options || {};

  const models = useModels({
    models: config.models,
    customViews: options?.customViews || [],
  });

  if (!config.models) {
    throw new Error("Please Provide the config in the LibProvider");
  }

  const { model: modelFromParams } = useParams<{
    model: string;
  }>();

  const [searchParams] = useSearchParams();
  const customView = searchParams.get("view");

  const model = modelFromOptions || modelFromParams;

  const modelConfig = models.modelList.find(([key, value]) => {
    return customView
      ? value.customName === customView
      : key === model && !value.customName;
  })?.[1];

  const getColumns = (): Column<{ id: string }>[] => {
    return (modelConfig?.view?.table?.columns || []) as Column<{
      id: string;
    }>[];
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
    ...modelConfig,
    ...models,
  };
};

export const useTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClickEdit = (dataItem: any) => {
    searchParams.set("action", "edit");
    searchParams.set("id", dataItem.id);

    setSearchParams(searchParams);
  };

  const handelClickAdd = () => {
    searchParams.set("action", "create");
    setSearchParams(searchParams);
  };

  return {
    handleClickEdit,
    handelClickAdd,
  };
};

export const useAdminPage = (options: { model?: string }) => {
  const { data: loaderData } = useLoaderData<LibLoaderData>() || {};
  const {
    items,
    columns,
    tags,
    customViews,
    navigationItems,
    navigationItemsHidden,
  } = loaderData || {};

  const model = useModel({
    ...options,
    customViews: customViews || [],
  });

  const navigate = useNavigate();

  const tagsCombobox = useTagsCombobox({
    onUpdateTags: (props) => handleUpdateTagsRef.current(props),
    items: items || [],
  });

  const [commands, setCommands] = React.useState<CommandbarConfig["actions"]>();

  const commandbar = useCommandbar({
    tagsCombobox,
    tags,
    hiddenNavigationItems: navigationItemsHidden,
    commands,
  });

  const addCommands = React.useCallback(
    (commands: CommandbarConfig["actions"]) => {
      setCommands(commands);
    },
    []
  );

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

  const { handelClickAdd, handleClickEdit } = useTable();

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
    if (!id) return;

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

  const fetcher = useFetcher();

  const handleDeleteNavigationItem = (navigationItemName: string) => {
    fetcher.submit(
      {
        name: navigationItemName,
        action: "deleteNavigationItem",
      },
      {
        method: "POST",
        action: `/admin/${model.model}`,
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

  const [deletedNavigationItems, setDeletedNavigationItems] = React.useState<
    NavigationItem[]
  >([]);

  const getLayoutProps = () => {
    const itemsWithoutParent: NavigationItem[] = [];
    const itemsWithParent: NavigationItem[] = [];

    const handleDeleteViewFromNavigation = (viewName: string) => {
      handleDeleteNavigationItem(viewName);
    };

    const handleClickDelete = (item: NavigationItem) => {
      setDeletedNavigationItems((prev) => [...prev, item]);
      handleDeleteViewFromNavigation(item.name);
    };

    model.modelList
      .filter(([key, value]) => {
        const customName = value.customName;

        if (deletedNavigationItems.find((item) => item.name === customName)) {
          return false;
        }

        if (deletedNavigationItems.find((item) => item.name === key)) {
          return false;
        }

        if (customName) {
          return navigationItems.includes(customName);
        } else {
          return navigationItems.includes(key);
        }
      })
      .forEach(([key, value]) => {
        const item = {
          parent: value.parent,
          label: value.title,
          icon: value.view?.navigation?.icon,
          name: key,
          onDelete: handleClickDelete,
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

  // const o

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
    addCommands,
    handelClickAdd: model.supportsAdd ? handelClickAdd : undefined,
    handleClickEdit: model.supportsEdit ? handleClickEdit : undefined,
    ...model,
  };
};

export const useCommandbar = ({
  tagsCombobox,
  tags,
  hiddenNavigationItems,
  commands,
}: {
  tagsCombobox: ReturnType<typeof useTagsCombobox>;
  tags: Tag[];
  hiddenNavigationItems?: string[];
  commands?: CommandbarConfig["actions"];
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [showCustomViewForm, setShowCustomViewForm] = React.useState(false);
  const [showTags, setShowTags] = React.useState(false);
  const [commandbarIsOpen, setCommandbarIsOpen] = React.useState(false);

  const [activeItem, setActiveItem] = React.useState<ComboboxItem>();

  const isInEditMode = searchParams.get("editMode") === "true";

  const fetcher = useFetcher();
  const fetcherSubmitRef = React.useRef(fetcher.submit);
  const openTagsRef = React.useRef(tagsCombobox.open);

  const navigation = useNavigation();

  const activeFormActionName = activeItem?.form ? activeItem?.name : undefined;
  const actionName = navigation.formData?.get("action");
  const isSubmitting =
    navigation.state === "submitting" && actionName === activeFormActionName;
  const isLoading =
    navigation.state === "loading" && actionName === activeFormActionName;

  React.useEffect(() => {
    setCommandbarIsOpen((prev) => {
      return tagsCombobox.isOpen !== prev ? tagsCombobox.isOpen : prev;
    });
  }, [tagsCombobox.isOpen]);

  const isSubmittingRef = React.useRef(false);
  React.useEffect(() => {
    if (isSubmitting) {
      isSubmittingRef.current = true;
    }
  }, [isSubmitting]);

  // after the form is submitted -> RESET THE ACTIVE ITEM
  React.useEffect(() => {
    if (isLoading && isSubmittingRef.current) {
      setActiveItem(undefined);
    }
  }, [isLoading]);

  const [commandbarConfig, setCommandbarConfig] =
    React.useState<CommandbarConfig>();

  React.useEffect(() => {
    const createCustomViewFormItems: CommandbarFormItem[] = [
      {
        label: "Name",
        name: "name",
      },
      {
        label: "Title",
        name: "title",
      },
      {
        label: "Description",
        name: "description",
        type: "textarea",
      },
      {
        label: "Show in navigation",
        name: "showInNavigation",
        type: "checkbox",
      },
    ];

    const commandbarConfig: CommandbarConfig = {
      actions: [
        {
          id: 1,
          label: "Create Custom View",
          name: "createCustomView",
          handler: () => {
            setShowCustomViewForm(true);
          },
          form: {
            title: "New Custom View",
            items: createCustomViewFormItems,
          },
        },
        {
          id: 2,
          label: "Filter by tags",
          name: "filterByTags",
          handler: () => {
            setShowTags(true);
            openTagsRef.current({ tags });
          },
        },

        {
          id: 3,
          label: isInEditMode ? "Exit edit mode" : "Edit mode",
          name: "editMode",
          handler: () => {
            isInEditMode && searchParams.delete("editMode");
            !isInEditMode && searchParams.set("editMode", "true");
            setSearchParams(searchParams);

            setCommandbarIsOpen(false);
          },
        },
        {
          id: 4,
          label: "Add View to Navigation",
          name: "addViewToNavigation",
          list:
            hiddenNavigationItems?.map((item, index) => {
              return {
                id: 4 + index,
                label: item,
                name: item,
                handler: () => {
                  fetcherSubmitRef.current(
                    {
                      name: item,
                      action: "addNavigationItem",
                    },
                    {
                      method: "POST",
                    }
                  );
                },
              };
            }) || [],
        },
      ],
    };
    setCommandbarConfig(commandbarConfig);
  }, [
    hiddenNavigationItems,
    isInEditMode,
    searchParams,
    setSearchParams,
    tags,
  ]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "k" && event.metaKey) {
      setCommandbarIsOpen(true);
    }
  };

  const closeTagsRef = React.useRef(tagsCombobox.onClose);
  const onClose = React.useCallback(() => {
    if (clickedEscapeRef.current) {
      clickedEscapeRef.current = false;
      return;
    }

    setCommandbarIsOpen(false);
    setTimeout(() => {
      // we dont want to see the change from the active item to the base commandbar
      closeTagsRef.current();
      setShowTags(false);

      setActiveItem(undefined);
    }, 300);
  }, []);

  const onBack = () => {
    if (activeItem) {
      console.log("CLOSE2");
      setActiveItem(undefined);
    } else {
      onClose();
    }
  };

  // add eent listener for esc key
  // if activeItem -> set activeItem to undefined
  // if no activeItem -> close commandbar
  const clickedEscapeRef = React.useRef(false);
  const handleEsc = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeItem) {
          setActiveItem(undefined);
        } else {
          clickedEscapeRef.current = true;
          onClose();
        }
      }
    },
    [activeItem, onClose]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleEsc]);

  const onSelect = (item: ComboboxItem) => {
    if (item.form || item.list) {
      setActiveItem(item);
      item.handler?.();
    } else if (item.handler) {
      item.handler?.();
    } else {
      setShowTags(false);
      onClose();
    }
  };

  const handleClickTags = () => {
    setShowTags(true);
    openTagsRef.current({ tags });
  };

  return {
    activeItem,
    commandbarConfig: {
      ...commandbarConfig,
      actions: commands || commandbarConfig?.actions || [],
    },
    isOpen: commandbarIsOpen,
    tagsCombobox,
    onClose,
    onBack,
    onSelect,
    showTags,
    showCustomViewForm,
    handleClickTags,
    isInEditMode,
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

  const selectedRef = React.useRef(selected);
  const commandBarRef = React.useRef(commandBar);

  React.useEffect(() => {
    selectedRef.current = selected;
    commandBarRef.current = commandBar;
  }, [commandBar, selected]);

  const handleCloseCommandBar = () => {
    const selected = selectedRef.current;
    const commandBar = commandBarRef.current;

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

  const labels = allTags.length
    ? Array.from(new Set(allTags.map((t) => t?.label)))
    : [];

  const all = labels.map(
    (label) => allTags.find((t) => t?.label === label) as Tag
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
