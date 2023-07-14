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
import type { LibActionData, LibLoaderData, ModelConfig } from "./types";

export const useModel = () => {
  const { config } = useContext(LibContext);

  if (!config.models) {
    throw new Error("Please Provide the config in the LibProvider");
  }

  const { model } = useParams<{
    model: string;
  }>();

  // invariant(model, "Model is required");

  const modelConfig = config.models[model as keyof typeof config["models"]] as
    | ModelConfig
    | undefined;

  const getColumns = () => {
    return modelConfig?.view?.table?.columns || [];
  };

  const pageTitle = modelConfig?.title;
  const supportsBulkDelete = modelConfig?.onBulkDelete !== undefined;
  const supportsDetailView = modelConfig?.view.detail !== undefined;
  const supportsAdd = modelConfig?.onAdd !== undefined;

  return {
    getColumns,
    pageTitle,
    addForm: modelConfig?.view.AddForm,
    supportsBulkDelete,
    supportsDetailView,
    supportsAdd,
    model,
    ...config,
  };
};

export const useAdminPage = () => {
  const model = useModel();
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

  const dataItemDeleted = navigationState.formData?.get("id");
  const dataItemsDeleted = navigationState.formData
    ? JSON.parse(navigationState.formData?.get("ids")?.toString() || "[]")
    : undefined;

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
      },
      {
        method: "POST",
      }
    );
  };

  const handleClickDetailView = (dataItem: any) => {
    navigate(`${dataItem.id}/detail`);
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

    // model.
    // get Formatted value?

    // for select fields
    // to get the id of the connected model
    const selectId =
      singleItem?.[(fieldModel?.selectField?.fieldId as string) || "id"];

    const _defaultValue =
      fieldModel?.formatValue?.(fieldDefaultValue) || fieldDefaultValue;
    return {
      ...field,
      selectId,
      key: field.name,
      // defaultOptions: selectedOptions,
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
    return {
      items: Object.entries(model.models).map(([key, value]) => {
        return {
          label: key,
          icon: value.view?.navigation?.icon,
          isCurrent: key === model.model,
        };
      }),
    };
  };

  // const view: View
  return {
    columns: model.getColumns(),
    optimisicData: dataListToRender,
    data,
    handelClickAdd: model.supportsAdd ? handelClickAdd : undefined,
    handleClickEdit,
    handelClickDelete,
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

    ...model,
  };
};
