import { Form, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import React from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { vacationLoader, vacationAction } from "~/features/vacation";
import { ActivityBookingBottomSheet } from "~/features/vacation/container/activity-booking-bottom-sheet";
import { ActivityList } from "~/features/vacation/container/activity-list";
import { Header } from "~/features/vacation/container/header";
import { VacationDatePicker } from "~/features/vacation/container/vacation-date-picker";
import { VacationNotFound } from "~/features/vacation/container/vacation-not-found";
import { VacationMap } from "~/features/vacation/mapper/vacationMapper";
import {
  initVacation,
  useVacationStore,
} from "~/features/vacation/store/vacation-store";

export const loader = vacationLoader;

export const action = vacationAction;

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>();

  const vacation = useVacationStore((state) => state.vacation);

  React.useEffect(() => {
    if (!data.vacation) return;
    initVacation(VacationMap.toDomain(data.vacation));
  }, [data.vacation]);

  // no vacation found
  if (!vacation.props && !data.vacation) return <VacationNotFound />;
  if (!vacation.props) return null;
  return <NotesContent />;
}

const NotesContent = () => {
  const vacation = useVacationStore((state) => state.vacation);
  const selectedDay = useVacationStore((state) => state.selectedDay);
  const activitiesSelectedDay = vacation.getActivityAtDate(selectedDay);
  const activitiesUnallocated = vacation.getUnallocatedActivities();

  return (
    <>
      <div className="flex h-full flex-col items-center ">
        <div className="pb-2 w-full">
          <Header />
        </div>
        {/* ActivityBottomshe */}
        <div className="max-w-3xl w-full">
          <ActivityBookingBottomSheet />

          <div className="mx-4 mt-2 flex flex-row items-center justify-center rounded-2xl bg-gray-700 pb-4 text-white">
            <VacationDatePicker />
          </div>

          {activitiesUnallocated.length ? (
            <ActivityList
              title={"Open Activities"}
              activities={activitiesUnallocated}
            />
          ) : null}

          <ActivityList
            title={format(selectedDay, "dd.MM.yyyy")}
            activities={activitiesSelectedDay}
          />
        </div>
      </div>
    </>
  );
};

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
      }}
    />
  );
}
