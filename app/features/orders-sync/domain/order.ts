import { type UserEntity } from "~/features/auth/domain/User";
import { type DateValueObject } from "~/features/vacation/domain/date";
import { Entity } from "~/shared/domain/entity";
import { type OrderMetaValueObject } from "./order-meta";
import { type OrderStatusValueObject } from "./order-status";
import { type ServiceList } from "./service-list";
import { type VacationBooking } from "./vacation";

interface OrderProps {
  id: number;
  orderKeyId: string;
  dateCreated: DateValueObject;
  dateModified: DateValueObject;
  dateImported: DateValueObject;
  paymentMethod: string;
  paymentMethod_title: string;
  orderMeta: OrderMetaValueObject;
  user: UserEntity;
  additionalServices: ServiceList;
  vacation: VacationBooking;
  status: OrderStatusValueObject;
}

export class OrderEntity extends Entity<OrderProps> {
  private constructor(props: OrderProps, id?: number) {
    super(props, id);
  }

  static create(props: OrderProps, id?: number) {
    return new OrderEntity(props, id);
  }
}
