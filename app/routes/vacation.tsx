import { type DataFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import React from "react";
import styles from "react-day-picker/dist/style.module.css";
import invariant from "tiny-invariant";
import { getXataClient } from "utils/xata";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { ActivityBookingBottomSheet } from "~/features/vacation/container/activity-booking-bottom-sheet";
import { ActivityList } from "~/features/vacation/container/activity-list";
import { VacationDatePicker } from "~/features/vacation/container/vacation-date-picker";
import type { VacationDtoProps } from "~/features/vacation/dto/vacation-dto";
import { VacationMap } from "~/features/vacation/mapper/vacationMapper";
import { useVacationStore } from "~/features/vacation/store/vacation-store";
import { isLoggedIn } from "~/utils/helper";
import { VacationRepoXata } from "~/features/vacation/repos/implementations/vacationRepoXata";
import { ActivityRepoXata } from "~/features/vacation/repos/implementations/activityRepoXata";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

interface LoaderData {
  vacation: VacationDtoProps;
}

export async function loader({
  request,
}: DataFunctionArgs): Promise<LoaderData> {
  const user = await isLoggedIn(request);

  invariant(user, "User not found");

  const client = getXataClient();

  const repo = new VacationRepoXata(client);

  const vacation = await repo.getVacationById("rec_chro3uqqsbcn5poqocb0");

  return { vacation };
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const datetime = formData.get("datetime");
  const activityId = formData.get("activityId");

  invariant(datetime, "datetime is required");
  invariant(activityId, "activityId is required");

  const client = getXataClient();

  const repo = new ActivityRepoXata(client);

  await repo.confirmDate(
    activityId as string,
    new Date(datetime as string).toISOString()
  );

  return {
    success: true,
  };
}

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>();
  const vacation = useVacationStore((state) => state.vacation);
  const init = useVacationStore((state) => state.initVacation);

  React.useEffect(() => {
    init(VacationMap.toDomain(data.vacation));
  }, [data.vacation, init]);

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
