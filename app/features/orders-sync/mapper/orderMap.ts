import { type Order, Prisma } from "@prisma/client";
import { type OrderEntity } from "../domain/order";

export class OrderMapper {
  // static toDomain({
  //   raw,
  //   meta,
  //   user,
  //   additionalServices,
  //   vacation,
  // }: {
  //   raw: RawOrder;
  //   user: UserEntity;
  //   additionalServices: ServiceList;
  //   meta: {
  //     crossfitBox: string;
  //     knowledgeFrom: string;
  //     addToCommunity: string;
  //   };
  //   vacation: VacationBooking;
  // }): OrderEntity {
  //   return OrderEntity.create({
  //     id: raw.id,
  //     orderKeyId: raw.order_key,
  //     dateCreated: new Date(raw.date_created),
  //     date_modified: new Date(raw.date_modified),
  //     date_imported: new Date(),
  //     payment_method: raw.payment_method,
  //     payment_method_title: raw.payment_method_title,
  //     add_to_community: meta.addToCommunity,
  //     knowledge_from: meta.knowledgeFrom,
  //     crossfit_box: meta.crossfitBox,
  //     user_id: +user.id,
  //     additionalServices,
  //     vacation,
  //   });
  // }

  static toPersistence(order: OrderEntity): Order {
    if (!order.props.dateCreated.value)
      throw new Error("DateCreated is required");
    if (!order.props.dateModified.value)
      throw new Error("DateModified is required");
    if (!order.props.dateImported.value)
      throw new Error("dateImported is required");
    if (!order.props.vacation.props.startDate.value)
      throw new Error("startDate is required");
    if (!order.props.vacation.props.endDate.value)
      throw new Error("endDate is required");

    // if (!order.props.user.id) throw new Error("duration is required");

    const _order: Order = {
      id: order.props.id,
      date_created: order.props.dateCreated.value,
      date_modified: order.props.dateModified.value,
      date_imported: order.props.dateImported.value,
      duration: order.props.vacation.props.duration,
      payment_method: order.props.paymentMethod,
      payment_method_title: order.props.paymentMethod_title,
      room_description: order.props.vacation.props.roomDescription,
      vacation_id: order.props.vacation.props.id,
      user_id: +order.props.user.id,
      start_date: order.props.vacation.props.startDate.value,
      end_date: order.props.vacation.props.endDate.value,
      persons: order.props.vacation.props.numberPersons,
      price: new Prisma.Decimal(order.props.vacation.props.price),
      crossfit_box: order.props.orderMeta.props.crossfitBox,
      knowledge_from: order.props.orderMeta.props.knowledgeFrom,
      add_to_community: order.props.orderMeta.props.addToCommunity,
      order_key: order.props.orderKeyId,
      status: order.props.status.value,
    };

    return _order;
  }
}
