import { useLoaderData, useSearchParams } from "@remix-run/react";
import React from "react";
import { Form, LibForm } from "~/components";
import { EventsActivityFeed } from "~/features/orders-sync/components/event-acitivity-feed";
import { CommentForm } from "~/features/orders-sync/components/event-activity-form";
import { InvoiceSummary } from "~/features/orders-sync/components/order-invoice-summary";
import { ServiceTableAdditional } from "~/features/orders-sync/components/order-services-additional";
import { ServiceTable } from "~/features/orders-sync/components/order-services-included";
import { OrderSummaryHeader } from "~/features/orders-sync/components/order-summary-header";
import { OrderMapper } from "~/features/orders-sync/mapper/orderMap";
import {
  singleOrderAction,
  singleOrderLoader,
} from "~/features/orders-sync/server-functions/single-order-actions.server";
import {
  initOrder,
  useOrderStore,
} from "~/features/orders-sync/store/vacation-store";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibSliderOver } from "~/utils/lib/react";
import { Pdf, PdfViewInvoiceView } from "./admin.woo";
import { OrderMainViewTabs } from "~/features/orders-sync/components/order-main-view-tabs";

export const loader = singleOrderLoader;

export const action = singleOrderAction;

export default function SyncOrdersPage() {
  const data = useLoaderData<typeof loader>();

  const orderStore = useOrderStore((store) => store.order);

  const { getFormProps, getOverlayProps } = useAdminPage({
    model: "VacationServices",
  });

  React.useEffect(() => {
    if (!data.order) return;

    const orderEntity = OrderMapper.fromDto(data.order);

    initOrder(orderEntity);
  }, [data]);

  if (!data.order) return <div>Not Found</div>;
  if (!orderStore.props) return <div>loading...</div>;

  return (
    <>
      <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()} title="Add Service to this order">
          <input type="hidden" name="action" value={"addAdditionalService"} />

          <Form.Select
            name="serviceName"
            onSelect={() => null}
            model="VacationServices"
            value={undefined}
          />
        </LibForm>
      </LibSliderOver>
      <OrderSummaryContent />
    </>
  );
}

export function OrderSummaryContent() {
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view");
  const isFullScreenView = searchParams.get("fullscreen") === "true";

  const isPdfInvoiceView = currentView === "pdf_invoice";

  if (isFullScreenView) {
    return <Pdf />;
  }

  return (
    <>
      <main className="h-full  overflow-scroll">
        <OrderSummaryHeader />

        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-2">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="lg:col-start-3">
              <InvoiceSummary />
            </div>

            <div className="lg:col-span-2 lg:row-span-2 lg:row-start-1 pr-8">
              <div className="pb-2">
                <OrderMainViewTabs />
              </div>
              {isPdfInvoiceView ? (
                <>
                  <PdfViewInvoiceView />
                </>
              ) : (
                <>
                  <div className="pt-12">
                    <ServiceTable />
                  </div>

                  <div className="pt-20">
                    <ServiceTableAdditional />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 lg:col-start-3 lg:row-start-2">
              <EventsActivityFeed />
              <CommentForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
