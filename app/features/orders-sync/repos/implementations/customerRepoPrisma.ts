import type { CustomerRepository } from "../customerRepo";
import type { PrismaClient } from "@prisma/client";
import { CustomerEntity } from "~/features/auth/domain/Member";
import { CustomerMap } from "../../mapper/customerMap";

export class CustomerRepoPrisma implements CustomerRepository {
  constructor(private client: PrismaClient) {}

  async create(customer: CustomerEntity): Promise<void> {
    const rawCustomer = CustomerMap.toPersistence(customer);
    const { user_id, id, ...customerProps } = rawCustomer;

    await this.client.customer.create({
      data: {
        ...customerProps,
        User: {
          connect: {
            id: rawCustomer.user_id,
          },
        },
      },
    });
  }

  async getCustomerByUserId(userId: number): Promise<CustomerEntity | null> {
    const customer = await this.client.customer.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!customer) return null;

    return CustomerEntity.create({
      ...customer,
      password: "",
    });
  }
}
