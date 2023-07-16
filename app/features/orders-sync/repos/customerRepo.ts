import type { CustomerEntity } from "~/features/auth/domain/Member";

export interface CustomerRepository {
  create(customer: CustomerEntity): Promise<void>;
  getCustomerByUserId(userId: number): Promise<CustomerEntity | null>;
}
