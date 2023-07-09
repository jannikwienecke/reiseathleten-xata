import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import React from "react";
import styles from "react-day-picker/dist/style.module.css";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { vacationLoader, vacationAction } from "~/features/vacation";
import { ActivityBookingBottomSheet } from "~/features/vacation/container/activity-booking-bottom-sheet";
import { ActivityList } from "~/features/vacation/container/activity-list";
import { VacationDatePicker } from "~/features/vacation/container/vacation-date-picker";
import { VacationMap } from "~/features/vacation/mapper/vacationMapper";
import {
  initVacation,
  useVacationStore,
} from "~/features/vacation/store/vacation-store";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader = vacationLoader;

export const action = vacationAction;

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>();
  const vacation = useVacationStore((state) => state.vacation);

  React.useEffect(() => {
    initVacation(VacationMap.toDomain(data.vacation));
  }, [data.vacation]);

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
      <div className="flex h-full flex-col">
        {/* ActivityBottomshe */}
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
