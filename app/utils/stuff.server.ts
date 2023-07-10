import type { DataFunctionArgs } from "@remix-run/node";
import type { ActivityRepo } from "~/features/vacation/repos/activityRepo";
// import { ActivityRepoMockServer } from "~/features/vacation/repos/implementations/activityRepoMockServer";
// import { VacationRepoMockServer } from "~/features/vacation/repos/implementations/vacationRepoMockServer";
import { prisma } from "~/db.server";
import { ActivityRepoMockServer } from "~/features/vacation/repos/implementations/activityRepoMockServer";
import { ActivityRepoPrisma } from "~/features/vacation/repos/implementations/activityRepoPrisma";
import { VacationRepoMockServer } from "~/features/vacation/repos/implementations/vacationRepoMockServer";
import { VacationRepoPrisma } from "~/features/vacation/repos/implementations/vacationRepoPrisma";
import type { VacationRepo } from "~/features/vacation/repos/vacationRepo";
import { IS_PRODUCTION } from "~/shared/constants/base";
import type { ActionFunctionArgs, PageHandler } from "./lib/core";
// import { IS_PRODUCTION } from "~/shared/constants/base";

export class AddHandlerServer implements PageHandler {
  async makeRequest(props: ActionFunctionArgs) {
    const { config } = props;

    await config.onAdd(props);
  }
}

interface Repository {
  vacation: VacationRepo;
  activity: ActivityRepo;
}

const initDataFunctions = (args: { repository: Repository }) => {
  const { repository } = args;

  const createLoader = <T>(
    loader: (
      args: DataFunctionArgs & {
        repository: Repository;
      }
    ) => T
  ) => {
    return async (args: DataFunctionArgs) => {
      return loader({ ...args, repository });
    };
  };

  return { createLoader, createAction: createLoader };
};

const vacationRepo = IS_PRODUCTION
  ? // ? new VacationRepoXata(client)
    new VacationRepoPrisma(prisma)
  : new VacationRepoMockServer();

const activityRepo = IS_PRODUCTION
  ? new ActivityRepoPrisma(prisma)
  : // ? new ActivityRepoXata(client)
    new ActivityRepoMockServer();

export const { createLoader, createAction } = initDataFunctions({
  repository: {
    vacation: vacationRepo,
    activity: activityRepo,
  },
});
