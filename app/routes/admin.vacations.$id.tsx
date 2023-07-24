import { useLoaderData } from "@remix-run/react";
import React from "react";
import { OrderMapper } from "~/features/orders-sync/mapper/orderMap";
import { singleOrderLoader } from "~/features/orders-sync/server-functions/single-order-actions.server";
import {
  initOrder,
  useOrderStore,
} from "~/features/orders-sync/store/vacation-store";

export const loader = singleOrderLoader;

export default function SyncOrdersPage() {
  const data = useLoaderData<typeof loader>();

  const orderStore = useOrderStore((store) => store.order);

  // const { getFormProps, getOverlayProps } = useAdminPage({
  //   model: "VacationServices",
  // });

  React.useEffect(() => {
    if (!data.order) return;

    const orderEntity = OrderMapper.fromDto(data.order);

    initOrder(orderEntity);
  }, [data]);

  if (!data.order) return <div>Not Found</div>;
  if (!orderStore.props) return <div>loading...</div>;

  return (
    <>
      {/* <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()} title="Add Service to this order">
          <input type="hidden" name="action" value={"addAdditionalService"} />

          <Form.Select
            name="serviceName"
            onSelect={() => null}
            model="VacationServices"
            value={undefined}
          />
        </LibForm> */}
      {/* </LibSliderOver> */}
      <OrderSummaryContent />
    </>
  );
}

export function OrderSummaryContent() {
  return (
    <>
      <main className="h-full  overflow-scroll">
        {/* <OrderSummaryHeader /> */}
        <div>HEADER</div>

        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-2">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="lg:col-start-3">
              {/* <InvoiceSummary /> */}
              SUMMARY
            </div>

            <div className="lg:col-span-2 lg:row-span-2 lg:row-start-1 pr-8">
              <div className="pb-2">
                <div>TABS</div>
                {/* <OrderMainViewTabs /> */}
              </div>

              <div className="pt-12">{/* <ServiceTable /> */}</div>
            </div>

            <div className="pt-4 lg:col-start-3 lg:row-start-2">
              {/* <EventsActivityFeed />
              <CommentForm /> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
