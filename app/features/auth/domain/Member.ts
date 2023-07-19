import { Entity } from "~/shared/domain/entity";

interface UserProps {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  title: string;
  title_formatted: string;
  shipping_address: string;
  user_id: number;
  birth_date: Date | null;
}

export class CustomerEntity extends Entity<UserProps> {
  private constructor(props: UserProps, id?: number) {
    super(props, id);
  }

  static create(props: UserProps, id?: number) {
    return new CustomerEntity(props, id);
  }

  get id() {
    return this._id as number;
  }
}
