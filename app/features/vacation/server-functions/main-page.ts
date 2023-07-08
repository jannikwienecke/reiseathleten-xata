import invariant from "tiny-invariant";
import { isLoggedIn } from "~/utils/helper";
import { createAction, createLoader } from "~/utils/stuff.server";
import type { VacationDtoProps } from "../dto/vacation-dto";

interface LoaderData {
  vacation: VacationDtoProps;
}

export const vacationLoader = createLoader(
  async ({ repository, request }): Promise<LoaderData> => {
    await isLoggedIn(request);

    const vacation = await repository.vacation.getVacationById(
      "rec_chro3uqqsbcn5poqocb0"
    );
    return { vacation };
  }
);

export const vacationAction = createAction(async ({ request, repository }) => {
  const formData = await request.formData();
  const datetime = formData.get("datetime");
  const activityId = formData.get("activityId");

  invariant(datetime, "datetime is required");
  invariant(activityId, "activityId is required");

  await repository.activity.confirmDate(
    activityId as string,
    new Date(datetime as string).toISOString()
  );

  return {
    success: true,
  };
});
