import { useLoaderData, useSearchParams } from "@remix-run/react";
import React from "react";
import { Form, LibForm } from "~/components";
import { DetailsTabs } from "~/features/orders-sync/components/order-main-view-tabs";
import { VacationDescription } from "~/features/orders-sync/components/vacation-description";
import { VacationServicesTable } from "~/features/orders-sync/components/vacation-services";
import { VacationSummary } from "~/features/orders-sync/components/vacation-summary";
import { VacationSummaryHeader } from "~/features/orders-sync/components/vacation-summary-headerr";
import { VacationDescriptionMap } from "~/features/orders-sync/mapper/vacationDescriptionMap";
import {
  singleVacationAction,
  singleVacationLoader,
} from "~/features/orders-sync/server-functions/single-vacations.server";
import {
  initVacationStore,
  useVacationState,
} from "~/features/orders-sync/store/single-vacation-store";
import { useAdminPage } from "~/utils/lib/hooks";
import { LibSliderOver } from "~/utils/lib/react";

export const loader = singleVacationLoader;
export const action = singleVacationAction;

export default function SyncOrdersPage() {
  const data = useLoaderData<typeof loader>();

  const vacationStore = useVacationState((store) => store.vacation);

  const { getFormProps, getOverlayProps } = useAdminPage({
    model: "VacationServices",
  });

  React.useEffect(() => {
    if (!data.vacationDescription) return;

    const orderEntity = VacationDescriptionMap.toDomain({
      vacationDescription: data.vacationDescription,
    });

    initVacationStore(orderEntity);
  }, [data]);

  if (!data.vacationDescription) return <div>Not Found</div>;
  if (!vacationStore.props) return <div>loading...</div>;

  return (
    <>
      <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()} title="Add Service to this Vacation">
          <input type="hidden" name="action" value={"addService"} />

          <Form.Select
            name="serviceName"
            onSelect={() => null}
            model="VacationServices"
            value={undefined}
          />
        </LibForm>
      </LibSliderOver>
      <VacationContent />
    </>
  );
}

const views = [
  { name: "vacation_services", label: "Services" },
  // description
  { name: "vacation_description", label: "Description" },
  { name: "pdf_invoice", label: "Invoice" },
];

export function VacationContent() {
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view");
  const showServicesView = !currentView || currentView === "vacation_services";
  const showDescriptionView = currentView === "vacation_description";

  return (
    <>
      <main className="h-full  overflow-scroll">
        <VacationSummaryHeader />

        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-2">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="lg:col-start-3">
              <VacationSummary />
            </div>

            <div className="lg:col-span-2 lg:row-span-2 lg:row-start-1 pr-8">
              <div className="pb-2">
                <DetailsTabs views={views} />
              </div>

              <div className="pt-12">
                {showServicesView ? (
                  <VacationServicesTable />
                ) : (
                  <VacationDescription />
                )}
              </div>
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
