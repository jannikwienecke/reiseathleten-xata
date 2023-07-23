import { Table } from "~/components";
import { useAdminPage } from "~/utils/lib/hooks";
import { useOrderStore } from "../store/vacation-store";

export const ServiceTableAdditional = () => {
  const order = useOrderStore((store) => store.order);
  const { columns, handelClickAdd, handelClickDelete } = useAdminPage({
    model: "Service",
  });

  const services = order.additionalServices;

  return (
    <>
      <Table
        onAdd={handelClickAdd}
        onDelete={handelClickDelete}
        disableSearch={true}
        compact={true}
        dataList={services.map((service) => {
          return {
            id: 0,
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
