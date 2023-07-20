import type { DataFunctionArgs } from "@remix-run/node";
import type { ActivityRepo } from "~/features/vacation/repos/activityRepo";
import { prisma } from "~/db.server";
import { ActivityRepoMockServer } from "~/features/vacation/repos/implementations/activityRepoMockServer";
import { ActivityRepoPrisma } from "~/features/vacation/repos/implementations/activityRepoPrisma";
import { VacationRepoMockServer } from "~/features/vacation/repos/implementations/vacationRepoMockServer";
import { VacationRepoPrisma as VationRepoPrismaApp } from "~/features/vacation/repos/implementations/vacationRepoPrisma";
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
import { OrderRepoPrisma } from "~/features/orders-sync/repos/implementations/orderRepoPrisma";
import { VacationBookingRepoPrisma } from "~/features/orders-sync/repos/implementations/vacationBookingRepoPrisma";
import { type OrderRepository } from "~/features/orders-sync/repos/orderRepo";
import { type VacationBookingRepo } from "~/features/orders-sync/repos/vacationRepo";
import { VacationServicesRepoPrisma } from "~/features/orders-sync/repos/implementations/vacationServicesRepoPrisma";
import { VacationServicesRepo } from "~/features/orders-sync/repos/vacationServicesRepo";

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
  order: OrderRepository;
  vacationBooking: VacationBookingRepo;
  vacationServices: VacationServicesRepo;
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
  ? new VationRepoPrismaApp(prisma)
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

const vacationBookingRepo = IS_PRODUCTION
  ? new VacationBookingRepoPrisma(prisma)
  : // TODO fix this
    new VacationBookingRepoPrisma(prisma);

// TODO fix this
const orderRepo = IS_PRODUCTION
  ? new OrderRepoPrisma(prisma, vacationBookingRepo)
  : new OrderRepoPrisma(prisma, vacationBookingRepo);

// TODO fix this
const vacationServicesRepo = IS_PRODUCTION
  ? new VacationServicesRepoPrisma(prisma)
  : new VacationServicesRepoPrisma(prisma);

export const { createLoader, createAction } = initDataFunctions({
  repository: {
    vacation: vacationRepo,
    activity: activityRepo,
    user: userRepo,
    orders: ordersRepo,
    customer: customerRepo,
    order: orderRepo,
    vacationBooking: vacationBookingRepo,
    vacationServices: vacationServicesRepo,
  },
  useCases: {
    syncOrders: new SyncOrdersUseCase(ordersRepo),
  },
});
