import type { UserEntity } from "~/features/auth/domain/User";
import type { RawOrder } from "../api/types";
import { OrderEntity } from "../domain/order";
import { type ServiceList } from "../domain/service-list";
import { type VacationBooking } from "../domain/vacation";

export class OrderMapper {
  static toDomain({
    raw,
    meta,
    user,
    additionalServices,
    vacation,
  }: {
    raw: RawOrder;
    user: UserEntity;
    additionalServices: ServiceList;
    meta: {
      crossfitBox: string;
      knowledgeFrom: string;
      addToCommunity: string;
    };
    vacation: VacationBooking;
  }): OrderEntity {
    return OrderEntity.create({
      id: raw.id,
      order_key: raw.order_key,
      date_created: new Date(raw.date_created),
      date_modified: new Date(raw.date_modified),
      date_imported: new Date(),
      payment_method: raw.payment_method,
      payment_method_title: raw.payment_method_title,
      add_to_community: meta.addToCommunity,
      knowledge_from: meta.knowledgeFrom,
      crossfit_box: meta.crossfitBox,
      user_id: +user.id,
      additionalServices,
      vacation,
    });
  }
}
