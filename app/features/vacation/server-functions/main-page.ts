import invariant from "tiny-invariant";
import { isLoggedIn } from "~/utils/helper";
import { createAction, createLoader } from "~/utils/stuff.server";
import type { VacationDtoProps } from "../dto/vacation-dto";

interface LoaderData {
  vacation: VacationDtoProps;
}

console.log("APP INIT");

export const vacationLoader = createLoader(
  async ({ repository, request }): Promise<LoaderData> => {
    console.log("vacationLoader");

    await isLoggedIn(request);

    console.log("IS LOGGED IN");

    console.log("repository", repository.vacation.getVacationById);

    try {
      const vacation = await repository.vacation.getVacationById(1);
      console.log("vacation", Boolean(vacation));
      return { vacation };
    } catch (error) {
      console.log("===", error);
      throw new Error("SOmething went wrong");

      // return { vacation: null };
    }
  }
);

export const vacationAction = createAction(async ({ request, repository }) => {
  const formData = await request.formData();
  const datetime = formData.get("datetime");
  const activityId = formData.get("activityId");

  invariant(datetime, "datetime is required");
  invariant(activityId, "activityId is required");

  await repository.activity.confirmDate(
    Number(activityId),
    new Date(datetime as string).toISOString()
  );

  return {
    success: true,
  };
});
