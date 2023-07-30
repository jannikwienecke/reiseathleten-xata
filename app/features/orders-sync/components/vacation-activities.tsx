import { useNavigation, useSubmit } from "@remix-run/react";
import { Table } from "~/components";
import { useAdminPage } from "~/utils/lib/hooks";
import { useVacationState } from "../store/single-vacation-store";

export const VacationActivitiesTable = () => {
  const submit = useSubmit();
  const vacation = useVacationState((store) => store.vacation);
  const { columns, handelClickAdd } = useAdminPage({
    model: "Service",
  });

  const { state, formData } = useNavigation();
  const isSubmitting = state !== "idle";
  const isDeleting = formData?.get("action") === "deleteVacationActivity";
  const idToDelete = formData?.get("id");

  const activities = vacation.activities;

  const handleClickDelete = (item: { id: number | undefined }) => {
    if (!item.id) return;

    submit(
      {
        id: item.id.toString(),
        action: "deleteVacationActivity",
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
        dataList={activities
          .filter((item, index) => {
            if (isSubmitting && isDeleting && idToDelete === item.toString()) {
              return false;
            }
            return true;
          })
          .map((service) => {
            return {
              id: service.id,
              name: service.name,
              description: service.description,
            };
          })}
        columns={columns}
        title={""}
      />
    </>
  );
};
