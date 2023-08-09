import { useLoaderData, useSearchParams } from "@remix-run/react";
import React from "react";
import { Form, LibForm } from "~/components";
import { VacationChildrenTable } from "~/features/orders-sync/components/children-vacation-table";
import { DetailsTabs } from "~/features/orders-sync/components/order-main-view-tabs";
import { VacationActivitiesTable } from "~/features/orders-sync/components/vacation-activities";
import { VacationDescription } from "~/features/orders-sync/components/vacation-description";
import { VacationHotelsTable } from "~/features/orders-sync/components/vacation-hotels";
import { VacationRoomsTable } from "~/features/orders-sync/components/vacation-rooms";
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

  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view");

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

  const dictViewAddAction = {
    vacation_services: "addService",
    vacation_children: "addChildVacation",
    vacation_activities: "addActivity",
    vacation_hotels: "addHotel",
    vacation_rooms: "addRoom",
  };

  const dictViewForm = {
    vacation_services: <FormSelectServices />,
    vacation_children: <FormSelectVacations />,
    vacation_activities: <FormActivities />,
    vacation_hotels: <FormHotels />,
    vacation_rooms: <FormRooms />,
  };

  const actionName =
    dictViewAddAction[currentView as keyof typeof dictViewAddAction];

  const FormSelect = dictViewForm[currentView as keyof typeof dictViewForm];

  return (
    <>
      <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()} title="Add Service to this Vacation">
          <input type="hidden" name="action" value={actionName} />
          {FormSelect ? FormSelect : null}
        </LibForm>
      </LibSliderOver>
      <VacationContent />
    </>
  );
}

const FormSelectServices = () => {
  return (
    <Form.Select
      name="serviceName"
      onSelect={() => null}
      model="VacationServices"
      value={undefined}
    />
  );
};

const FormSelectVacations = () => {
  return (
    <Form.Select
      name="vacation"
      onSelect={() => null}
      model="Vacation"
      value={undefined}
    />
  );
};

const FormActivities = () => {
  return (
    <Form.Select
      name="acitivityName"
      onSelect={() => null}
      model="DefaultActivityVacation"
      value={undefined}
    />
  );
};

const FormHotels = () => {
  return (
    <Form.Select
      name="hotel"
      onSelect={() => null}
      model="hotel"
      value={undefined}
    />
  );
};

const FormRooms = () => {
  return (
    <Form.Select
      name="room"
      onSelect={() => null}
      model="room"
      value={undefined}
    />
  );
};

export function VacationContent() {
  const vacation = useVacationState((store) => store.vacation);
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view");

  const views = [
    { name: "vacation_description", label: "Description" },
    { name: "vacation_services", label: "Services" },
    { name: "vacation_hotels", label: "Hotels" },
    { name: "vacation_rooms", label: "Rooms" },
  ];

  if (vacation.props.isParent) {
    views.push({ name: "vacation_children", label: "Vacations" });
  }

  console.log("ACTIVTIES:", vacation.activities);

  if (vacation.activities.length > 0) {
    views.push({ name: "vacation_activities", label: "Activities" });
  }

  const dict = {
    vacation_services: <VacationServicesTable />,
    vacation_description: <VacationDescription />,
    vacation_children: <VacationChildrenTable />,
    vacation_activities: <VacationActivitiesTable />,
    vacation_hotels: <VacationHotelsTable />,
    vacation_rooms: <VacationRoomsTable />,
  };

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

              {currentView ? (
                <div className="pt-12">
                  {dict[currentView as keyof typeof dict]}
                </div>
              ) : null}
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
