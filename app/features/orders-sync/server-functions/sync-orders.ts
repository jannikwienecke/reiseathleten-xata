import { CustomerEntity } from "~/features/auth/domain/Member";
import type { UserEntity } from "~/features/auth/domain/User";
import { createLoader } from "~/utils/stuff.server";
import { type RawOrder } from "../api/types";

export const syncOrdersLoader = createLoader(
  async ({ useCases, repository }) => {
    async function _handleUserAndCustomerCreation(order: RawOrder) {
      const userExists = await userRepo.hasUserWithEmail(order.billing.email);

      let user: UserEntity | null = null;

      if (!userExists) {
        // create user -> signup
        user = await userRepo.signup({
          email: order.billing.email,
          password: "123456",
        });
      } else {
        user = await userRepo.login({
          email: order.billing.email,
          password: "123456",
        });
      }

      if (!user) throw new Error("Cannot create user");

      const customer = await repository.customer.getCustomerByUserId(
        user?.id as number
      );

      if (!customer) {
        const customer = CustomerEntity.create({
          ...order.billing,
          user_id: +user.id,
          password: "123456",
          shipping_address: JSON.stringify(order.shipping),
        });

        await repository.customer.create(customer);
      }
    }

    const orders = await useCases.syncOrders.execute();

    const userRepo = repository.user;

    orders.forEach(async (order) => {
      console.log("ORDER: ", order.id);

      // await _handleUserAndCustomerCreation(order);
    });

    return {
      orders,
    };
  }
);
