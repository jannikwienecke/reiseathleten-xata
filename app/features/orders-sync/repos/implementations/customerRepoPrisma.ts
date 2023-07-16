import type { CustomerRepository } from "../customerRepo";
import type { PrismaClient } from "@prisma/client";
import { CustomerEntity } from "~/features/auth/domain/Member";
import { CustomerMap } from "../../mapper/customerMap";

export class CustomerRepoPrisma implements CustomerRepository {
  constructor(private client: PrismaClient) {}

  async create(customer: CustomerEntity): Promise<void> {
    await this.client.customer.create({
      data: {
        ...CustomerMap.toPersistence(customer),
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
