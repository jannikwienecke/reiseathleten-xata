import type { DataFunctionArgs } from "@remix-run/node";
import type { ActivityRepo } from "~/features/vacation/repos/activityRepo";
import { prisma } from "~/db.server";
import { ActivityRepoMockServer } from "~/features/vacation/repos/implementations/activityRepoMockServer";
import { ActivityRepoPrisma } from "~/features/vacation/repos/implementations/activityRepoPrisma";
import { VacationRepoMockServer } from "~/features/vacation/repos/implementations/vacationRepoMockServer";
import { VacationRepoPrisma } from "~/features/vacation/repos/implementations/vacationRepoPrisma";
import type { VacationRepo } from "~/features/vacation/repos/vacationRepo";
import { IS_PRODUCTION } from "~/shared/constants/base";
import type { UserRepo } from "~/features/auth/repos/userRepo";
import { UserRepoPrisma } from "~/features/auth/repos/implementations/userRepoPrisma";
import { UserRepoMock } from "~/features/auth/repos/implementations/userRepoMockServer";
import { OrdersRepoWooCommerce } from "~/features/orders-sync/repos/implementations/ordersRepoWooCommerce";
import { createWooCommerceClient } from "~/features/orders-sync/api/helper";
import { OrdersRepoMockServer } from "~/features/orders-sync/repos/implementations/ordersRepoMockServer";
import type { OrdersRepository } from "~/features/orders-sync/repos/ordersRepo";
import type { ActionFunctionArgs, PageHandler } from "./lib/types";
import { SyncOrdersUseCase } from "~/features/orders-sync/use-cases/sync-orders";
import type { RawOrder } from "~/features/orders-sync/api/types";
import { CustomerRepoPrisma } from "~/features/orders-sync/repos/implementations/customerRepoPrisma";
import { CustomerRepoMockServer } from "~/features/orders-sync/repos/implementations/customerRepoMockServer";
import type { CustomerRepository } from "~/features/orders-sync/repos/customerRepo";

export class AddHandlerServer implements PageHandler {
  async makeRequest(props: ActionFunctionArgs) {
    const { config } = props;

    await config.onAdd?.(props);
  }
}

interface Repository {
  vacation: VacationRepo;
  activity: ActivityRepo;
  user: UserRepo;
  orders: OrdersRepository;
  customer: CustomerRepository;
}

interface UseCase<T> {
  execute: () => Promise<T>;
}

interface UseCases {
  syncOrders: UseCase<RawOrder[]>;
}

const initDataFunctions = (args: {
  repository: Repository;
  useCases: UseCases;
}) => {
  const { repository, useCases } = args;

  const createLoader = <T>(
    loader: (
      args: DataFunctionArgs & {
        repository: Repository;
        useCases: UseCases;
      }
    ) => T
  ) => {
    return async (args: DataFunctionArgs) => {
      return loader({ ...args, repository, useCases });
    };
  };

  return { createLoader, createAction: createLoader };
};

const vacationRepo = IS_PRODUCTION
  ? new VacationRepoPrisma(prisma)
  : new VacationRepoMockServer();

const activityRepo = IS_PRODUCTION
  ? new ActivityRepoPrisma(prisma)
  : new ActivityRepoMockServer();

const userRepo = IS_PRODUCTION
  ? new UserRepoPrisma(prisma)
  : new UserRepoMock();

const ordersRepo = IS_PRODUCTION
  ? new OrdersRepoWooCommerce(createWooCommerceClient())
  : // new OrdersRepoMockServer()
    new OrdersRepoMockServer();

const customerRepo = IS_PRODUCTION
  ? new CustomerRepoPrisma(prisma)
  : new CustomerRepoMockServer();

export const { createLoader, createAction } = initDataFunctions({
  repository: {
    vacation: vacationRepo,
    activity: activityRepo,
    user: userRepo,
    orders: ordersRepo,
    customer: customerRepo,
  },
  useCases: {
    syncOrders: new SyncOrdersUseCase(ordersRepo),
  },
});
