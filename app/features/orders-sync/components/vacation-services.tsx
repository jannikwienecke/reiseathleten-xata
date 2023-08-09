import { useNavigation, useSubmit } from "@remix-run/react";
import { Table } from "~/components";
import { useTable } from "~/utils/lib/hooks";
import { useVacationState } from "../store/single-vacation-store";

export const VacationServicesTable = () => {
  const submit = useSubmit();
  const vacation = useVacationState((store) => store.vacation);

  const { handelClickAdd } = useTable();

  const { state, formData } = useNavigation();
  const isSubmitting = state !== "idle";
  const isDeleting = formData?.get("action") === "deleteVacationService";
  const indexToDelete = formData?.get("indexToDelete");

  const services = vacation.services;

  const handleClickDelete = (item: {
    id: number | undefined;
    index: number;
  }) => {
    if (!item.id) return;

    submit(
      {
        id: item.id.toString(),
        action: "deleteVacationService",
        indexToDelete: item.index.toString(),
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
            if (
              isSubmitting &&
              isDeleting &&
              indexToDelete === index.toString()
            ) {
              return false;
            }
            return true;
          })
          .map((service, index) => {
            return {
              id: service.id,
              name: service.props.name,
              description: service.props.description,
              index: index,
            };
          })}
        columns={[
          {
            accessorKey: "name",
            header: "Name",
          },
          {
            accessorKey: "description",
            header: "Description",
          },
        ]}
        title={""}
      />
    </>
  );
};
