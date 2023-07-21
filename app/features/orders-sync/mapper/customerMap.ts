import { type Customer } from "@prisma/client";
import type { CustomerEntity } from "~/features/auth/domain/Member";

export class CustomerMap {
  public static toPersistence(customer: CustomerEntity): Customer {
    // remove password from customer props
    const { password, ...customerProps } = customer.props;

    return {
      id: customer.id,
      address_1: customerProps.address_1,
      address_2: customerProps.address_2,
      city: customerProps.city,
      company: customerProps.company,
      country: customerProps.country,
      email: customerProps.email,
      first_name: customerProps.first_name,
      last_name: customerProps.last_name,
      phone: customerProps.phone,
      postcode: customerProps.postcode,
      state: customerProps.state,
      birth_date: customerProps.birth_date ?? "",
      title: customerProps.title,
      title_formatted: customerProps.title_formatted,
      shipping_address: customerProps.shipping_address,
      user_id: customerProps.user_id,
    };
  }
}
