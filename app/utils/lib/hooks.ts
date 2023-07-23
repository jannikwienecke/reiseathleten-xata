import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import React, { useContext } from "react";
import invariant from "tiny-invariant";
import { LibContext } from "./react";
import type {
  Dict,
  LibActionData,
  LibLoaderData,
  ModelConfig,
  NavigationItem,
  TableActionType,
} from "./types";

export const useModel = (options?: { model?: string }) => {
  const { config } = useContext(LibContext);
  const { model: modelFromOptions } = options || {};

  if (!config.models) {
    throw new Error("Please Provide the config in the LibProvider");
  }

  const { model: modelFromParams } = useParams<{
    model: string;
  }>();

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
    model,
    ...config,
    ...modelConfig,
  };
};

export const useAdminPage = (options?: { model?: string }) => {
  const model = useModel(options);
  const navigate = useNavigate();
  const { data } = useLoaderData<LibLoaderData>() || {};

  const actionData = useActionData<LibActionData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigationState = useNavigation();
  const id = searchParams.get("id");
  const singleItem = data?.find?.(
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

  const handleClickEdit = (dataItem: any) => {
    searchParams.set("action", "edit");
    searchParams.set("id", dataItem.id);

    setSearchParams(searchParams);
  };

  const handelClickAdd = () => {
    searchParams.set("action", "create");
    setSearchParams(searchParams);
  };

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
    data?.filter((data: any) => {
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

    // for select fields
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

    Object.entries(model.models).forEach(([key, value]) => {
      const item = {
        parent: value.parent,
        label: value.title,
        icon: value.view?.navigation?.icon,
        isCurrent: key === model.model,
        name: key,
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

  // const view: View
  return {
    columns: model.getColumns(),
    optimisicData: dataListToRender,
    data,
    handelClickAdd: model.supportsAdd ? handelClickAdd : undefined,
    handleClickEdit: model.supportsEdit ? handleClickEdit : undefined,
    handelClickDelete: model.supportsDelete ? handelClickDelete : undefined,
    handleClickBulkDelete: model.supportsBulkDelete
      ? handleClickBulkDelete
      : undefined,
    handleClickDetailView: model.supportsDetailView
      ? handleClickDetailView
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

    ...model,
  };
};
