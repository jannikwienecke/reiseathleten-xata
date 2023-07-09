import type { DataFunctionArgs } from "@remix-run/node";
import { getXataClient } from "utils/xata";
import type { ActivityRepo } from "~/features/vacation/repos/activityRepo";
// import { ActivityRepoMockServer } from "~/features/vacation/repos/implementations/activityRepoMockServer";
// import { VacationRepoMockServer } from "~/features/vacation/repos/implementations/vacationRepoMockServer";
import type { VacationRepo } from "~/features/vacation/repos/vacationRepo";
import type { ActionFunctionArgs, PageHandler } from "./lib/core";
import { ActivityRepoXata } from "~/features/vacation/repos/implementations/activityRepoXata";
import { VacationRepoXata } from "~/features/vacation/repos/implementations/vacationRepoXata";
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

const client = getXataClient();

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

// const vacationRepo = IS_PRODUCTION
//   ? new VacationRepoXata(client)
//   : new VacationRepoMockServer();

// const activityRepo = IS_PRODUCTION
//   ? new ActivityRepoXata(client)
//   : new ActivityRepoMockServer();

export const { createLoader, createAction } = initDataFunctions({
  repository: {
    vacation: new VacationRepoXata(client),
    activity: new ActivityRepoXata(client),
  },
});
