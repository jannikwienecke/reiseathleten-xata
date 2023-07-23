import { Table } from "~/components";
import { useAdminPage } from "~/utils/lib/hooks";
import { useOrderStore } from "../store/vacation-store";

export const ServiceTable = () => {
  const order = useOrderStore((store) => store.order);
  const { columns } = useAdminPage({
    model: "Service",
  });

  const services = order.standardServices;

  return (
    <>
      <Table
        actions={[]}
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
        title={"Services"}
      />
    </>
  );
};
