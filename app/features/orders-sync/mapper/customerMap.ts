import type { CustomerEntity } from "~/features/auth/domain/Member";

export class CustomerMap {
  public static toPersistence(
    customer: CustomerEntity
  ): Omit<CustomerEntity["props"], "password"> {
    // remove password from customer props
    const { password, ...customerProps } = customer.props;

    return {
      ...customerProps,
    };
  }
}
