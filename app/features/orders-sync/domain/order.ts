import { type UserEntity } from "~/features/auth/domain/User";
import { type DateValueObject } from "~/features/vacation/domain/date";
import { Entity } from "~/shared/domain/entity";
import { type OrderMetaValueObject } from "./order-meta";
import { type OrderStatusValueObject } from "./order-status";
import { type ServiceList } from "./service-list";
import { type VacationBooking } from "./vacation";
import type { ServiceValueObject } from "./service";
import type { ActivityEventList } from "./activity-event-list";
import { type ActivityEvent } from "./activity-event";
import { HotelType, RoomType } from "../mapper/vacationDescriptionMap";

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
  activityEvents: ActivityEventList;
  hotel?: HotelType;
  room?: RoomType;
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

  addNewService(service: ServiceValueObject) {
    this.props.additionalServices.addService(service);
  }

  deleteAdditionalService(serviceId: number) {
    this.props.additionalServices.removeService(serviceId);
  }

  updateStatus() {
    this.props.status.update();
  }

  get status(): OrderStatusValueObject {
    return this.props.status;
  }

  get price(): number {
    return this.props.vacation.props.price;
  }

  get username(): string {
    return this.props.user.props.email;
  }

  get statusText(): string {
    return this.props.status.value;
  }

  get dispayStartDate(): string {
    return this.props.vacation.props.startDate.displayDate;
  }

  get displayEndDate(): string {
    return this.props.vacation.props.endDate.displayDate;
  }

  get displayDateCreated(): string {
    return this.props.dateCreated.displayDate;
  }

  get displayDatePaid(): string {
    const paidEvent = this.props.activityEvents.list.find(
      (e) => e.type === "paid"
    );
    if (!paidEvent) return "";

    return paidEvent.dateString;
  }

  addActivityEvent(event: ActivityEvent) {
    this.props.activityEvents.addEvent(event);
  }

  get room(): RoomType | undefined {
    return this.props?.room;
  }

  get hotel(): HotelType | undefined {
    return this.props?.hotel;
  }

  set room(room: RoomType | undefined) {
    this.props.room = room;
  }

  set hotel(hotel: HotelType | undefined) {
    this.props.hotel = hotel;
  }
}
