import { Table } from "~/components";
import { useAdminPage } from "~/utils/lib/hooks";
import { useOrderStore } from "../store/vacation-store";
import { useNavigation, useSubmit } from "@remix-run/react";

export const ServiceTableAdditional = () => {
  const submit = useSubmit();
  const order = useOrderStore((store) => store.order);
  const { columns, handelClickAdd } = useAdminPage({
    model: "Service",
  });

  const { state, formData } = useNavigation();
  const isSubmitting = state !== "idle";
  const isDeleting = formData?.get("action") === "deleteAdditionalService";
  const idToDelete = formData?.get("id");

  const services = order.additionalServices;

  const handleClickDelete = (item: { id: number }) => {
    submit(
      {
        id: item.id.toString(),
        action: "deleteAdditionalService",
      },
      {
        method: "POST",
      }
    );
  };

  return (
    <>
      <Table
        onAdd={handelClickAdd}
        onDelete={handleClickDelete}
        disableSearch={true}
        compact={true}
        dataList={services
          .filter((_, index) => {
            if (isSubmitting && isDeleting && idToDelete === index.toString()) {
              return false;
            }
            return true;
          })
          .map((service, index) => {
            return {
              id: index,
              name: service.props.name,
              description: service.props.description,
            };
          })}
        columns={columns}
        title={"Additional Service's"}
      />
    </>
  );
};
