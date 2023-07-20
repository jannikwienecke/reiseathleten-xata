import { useLoaderData } from "@remix-run/react";
import { type OrderEntity } from "~/features/orders-sync/domain/order";
import { OrderMapper } from "~/features/orders-sync/mapper/orderMap";
import { syncOrdersLoader } from "~/features/orders-sync/server-functions/sync-orders";

export const loader = syncOrdersLoader;

export default function Index() {
  const data = useLoaderData();

  const orders: OrderEntity[] = data?.orders.map((order: any) =>
    OrderMapper.fromDto(order)
  );

  return (
    <>
      {orders.map((order) => {
        return (
          <div className="bg-red-300 m-2 p-1" key={order.props.id}>
            {order.standardServices.map((service) => {
              return (
                <div className="bg-blue-300" key={service.props.name}>
                  {service.props.name}
                </div>
              );
            })}

            <div>ADDITIONAL</div>
            {order.additionalServices.map((service) => {
              return (
                <div className="bg-blue-300" key={service.props.name}>
                  {service.props.name}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// export const action = createPdfAction;

// export default function Index() {
//   const [clicked, setClicked] = React.useState(false);
//   return (
//     <>
//       <Form method="post">
//         <button>CLICK ME FOR PUPETEER</button>
//       </Form>

//       <button
//         onClick={() => {
//           setClicked(true);
//         }}
//       >
//         test
//       </button>

//       {clicked && <div>CLICKED</div>}
//     </>
//   );
// }
