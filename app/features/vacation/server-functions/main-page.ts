import invariant from "tiny-invariant";
import { isLoggedIn } from "~/utils/helper";
import { createAction, createLoader } from "~/utils/stuff.server";
import type { VacationDtoProps } from "../dto/vacation-dto";

interface LoaderData {
  vacation: VacationDtoProps | null;
}

export const vacationLoader = createLoader(
  async ({ repository, request, params }): Promise<LoaderData> => {
    const user = await isLoggedIn(request, {
      failureRedirect: `/login?redirect=/vacations/${params.id}`,
    });
    const { id } = params;

    invariant(id, "id is required");
    invariant(user, "user is required");

    const isAdmin = user.props.email === "admin@admin.de";

    const vacation = await repository.vacation.getVacationById(
      Number(id),
      Number(user?.props.id),
      isAdmin
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
    Number(activityId),
    new Date(datetime as string).toISOString()
  );

  return {
    success: true,
  };
});
