import { useNavigation, useSubmit } from "@remix-run/react";
import { Table } from "~/components";
import { useTable } from "~/utils/lib/hooks";
import { useVacationState } from "../store/single-vacation-store";

export const VacationChildrenTable = () => {
  const submit = useSubmit();
  const vacation = useVacationState((store) => store.vacation);
  const { handelClickAdd } = useTable();

  const { state, formData } = useNavigation();
  const isSubmitting = state !== "idle";
  const isDeleting = formData?.get("action") === "deleteAdditionalService";
  const idToDelete = formData?.get("id");

  const children = vacation.props.children;

  const handleClickDelete = (item: { id: number }) => {
    submit(
      {
        id: item.id.toString(),
        action: "deleteChildVacation",
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
        dataList={children
          .filter((_, index) => {
            if (isSubmitting && isDeleting && idToDelete === index.toString()) {
              return false;
            }
            return true;
          })
          .map((child, index) => {
            return {
              id: child.id,
              name:
                child.name.length > 100
                  ? child.name.slice(0, 100) + "..."
                  : child.name,
            };
          })}
        columns={[
          {
            accessorKey: "name",
            header: "Name",
          },
        ]}
        title={""}
      />
    </>
  );
};
