import { type UserEntity } from "~/features/auth/domain/User";
import { type DateValueObject } from "~/features/vacation/domain/date";
import { Entity } from "~/shared/domain/entity";
import { type OrderMetaValueObject } from "./order-meta";
import { type OrderStatusValueObject } from "./order-status";
import { type ServiceList } from "./service-list";
import { type VacationBooking } from "./vacation";
import { ServiceValueObject } from "./service";

export interface OrderProps {
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
  orderId: number;
}

export class OrderEntity extends Entity<OrderProps> {
  private constructor(props: OrderProps, id?: number) {
    super(props, id);
  }

  static create(props: OrderProps, id?: number) {
    return new OrderEntity(props, id);
  }

  get statusButtonText(): string {
    return this.props.status.buttonText;
  }

  get standardServices(): ServiceValueObject[] {
    return this.props.vacation.services;
  }

  get additionalServices(): ServiceValueObject[] {
    return this.props.additionalServices.list;
  }
}
