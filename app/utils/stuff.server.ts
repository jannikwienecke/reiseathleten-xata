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
import type { DataFunctionArgs } from "./lib/types";
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
import type { ServicesRepo } from "~/features/orders-sync/repos/vacationServicesRepo";
import { VacationBookingRepoMockServer } from "~/features/orders-sync/repos/implementations/vacationBookingRepoMockServer";
import { VacationServicesRepoMockServer } from "~/features/orders-sync/repos/implementations/vacationServicesRepoMockServer";
import { OrderRepoMockServer } from "~/features/orders-sync/repos/implementations/orderRepoMockServer";
import { OrderActivityEventRepoPrisma } from "~/features/orders-sync/repos/implementations/orderActivityEventRepoPrisma";
import { type OrderActivityEventRepo } from "~/features/orders-sync/repos/orderActivityEventRepo";

export interface Repository {
  vacation: VacationRepo;
  activity: ActivityRepo;
  user: UserRepo;
  orders: OrdersRepository;
  customer: CustomerRepository;
  order: OrderRepository;
  vacationBooking: VacationBookingRepo;
  vacationServices: ServicesRepo;
  orderActivityEventRepo: OrderActivityEventRepo;
}

interface UseCase<T> {
  execute: () => Promise<T>;
}

export interface UseCases {
  syncOrders: UseCase<RawOrder[]>;
}

export type ServerFunctionArgs = DataFunctionArgs & {
  repository: Repository;
  useCases: UseCases;
};

const initDataFunctions = (args: {
  repository: Repository;
  useCases: UseCases;
}) => {
  const { repository, useCases } = args;

  const createLoader = <T>(loader: (args: ServerFunctionArgs) => T) => {
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
  : new OrdersRepoMockServer();

const customerRepo = IS_PRODUCTION
  ? new CustomerRepoPrisma(prisma)
  : new CustomerRepoMockServer();

const vacationBookingRepo = IS_PRODUCTION
  ? new VacationBookingRepoPrisma(prisma)
  : new VacationBookingRepoMockServer();

const vacationServicesRepo = IS_PRODUCTION
  ? new VacationServicesRepoPrisma(prisma)
  : new VacationServicesRepoMockServer();

const orderActivityEventRepo = IS_PRODUCTION
  ? new OrderActivityEventRepoPrisma(prisma)
  : new OrderActivityEventRepoPrisma(prisma);

const orderRepo = IS_PRODUCTION
  ? new OrderRepoPrisma(prisma, vacationBookingRepo, orderActivityEventRepo)
  : new OrderRepoMockServer();

export const { createLoader, createAction } = initDataFunctions({
  repository: {
    vacation: vacationRepo,
    activity: activityRepo,
    user: userRepo,
    orders: ordersRepo,
    customer: customerRepo,
    // FIXME
    order: orderRepo,
    vacationBooking: vacationBookingRepo,
    vacationServices: vacationServicesRepo,
    orderActivityEventRepo,
  },
  useCases: {
    syncOrders: new SyncOrdersUseCase(ordersRepo, orderRepo),
  },
});
