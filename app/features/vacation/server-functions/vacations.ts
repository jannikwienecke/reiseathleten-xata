import { isLoggedIn } from "~/utils/helper";
import { createLoader } from "~/utils/stuff.server";
import { type VacationsDtoProps } from "../dto/vacation-dto";
import invariant from "tiny-invariant";

export interface VacationsLoaderData {
  vacations: VacationsDtoProps;
}

export const vacationsLoader = createLoader(
  async ({ repository, request }): Promise<VacationsLoaderData> => {
    const user = await isLoggedIn(request, {
      failureRedirect: `/login?redirect=/vacations`,
    });

    invariant(user, "user is required");

    if (user.props.email === "admin@admin.de") {
      const vacations = await repository.vacation.getAllVacations();
      return { vacations };
    } else {
      const vacations = await repository.vacation.getVacationsByUserId(
        Number(user.props.id)
      );
      return { vacations };
    }
  }
);
