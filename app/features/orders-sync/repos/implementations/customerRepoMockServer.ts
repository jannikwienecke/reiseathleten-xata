import { waitFor } from "~/utils/misc";
import type { CustomerRepository } from "../customerRepo";
import type { CustomerEntity } from "~/features/auth/domain/Member";

export class CustomerRepoMockServer implements CustomerRepository {
  async create(): Promise<void> {
    await waitFor(1000);
  }

  async getCustomerByUserId(userId: number): Promise<CustomerEntity | null> {
    await waitFor(1000);

    return null;
  }
}
