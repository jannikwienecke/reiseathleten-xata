import { type Order, Prisma } from "@prisma/client";
import { OrderProps, OrderEntity } from "../domain/order";
import { ServiceValueObject } from "../domain/service";
import { OrderStatusValueObject } from "../domain/order-status";
import { OrderMetaValueObject } from "../domain/order-meta";
import { VacationBooking } from "../domain/vacation";
import { DateValueObject } from "~/features/vacation/domain/date";
import { ServiceList } from "../domain/service-list";
import { UserEntity } from "~/features/auth/domain/User";

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
      additional_services: JSON.stringify(
        order.additionalServices.map((service) => ({
          name: service.props.name,
          description: service.props.description,
        }))
      ),
    };

    return _order;
  }

  static toDto(order: OrderEntity) {
    return {
      id: order.props.id,
      dateCreated: order.props.dateCreated.value?.toISOString() ?? "",
      dateModified: order.props.dateModified.value?.toISOString() ?? "",
      dateImported: order.props.dateImported.value?.toISOString() ?? "",
      duration: order.props.vacation.props.duration,
      paymentMethod: order.props.paymentMethod,
      paymentMethod_title: order.props.paymentMethod_title,

      // vacation
      vacation: {
        id: order.props.vacation.props.id,
        startDate:
          order.props.vacation.props.startDate.value?.toISOString() ?? "",
        endDate: order.props.vacation.props.endDate.value?.toISOString() ?? "",
        roomDescription: order.props.vacation.props.roomDescription,
        price: order.props.vacation.props.price,
        numberPersons: order.props.vacation.props.numberPersons,
        imageUrl: order.props.vacation.props.imageUrl,
        name: order.props.vacation.props.name,
        description: order.props.vacation.props.description ?? "",
        services: order.standardServices.map((service) => ({
          ...service.props,
        })),
        duration: order.props.vacation.props.duration,
      },

      // user
      user: {
        id: order.props.user.id,
        email: order.props.user.props.email,
      },

      // additionalServices: ServiceList;
      additionalServices: order.additionalServices.map((service) => ({
        ...service.props,
      })),

      // status
      status: order.props.status.value,

      // orderMeta
      orderMeta: {
        crossfitBox: order.props.orderMeta.props.crossfitBox,
        knowledgeFrom: order.props.orderMeta.props.knowledgeFrom,
        addToCommunity: order.props.orderMeta.props.addToCommunity,
      },

      // orderKey
      orderKey: order.props.orderKeyId,
    } as const;
  }

  static fromDto(order: ReturnType<typeof OrderMapper["toDto"]>): OrderEntity {
    const additionalServices = order.additionalServices.map((service) => {
      return ServiceValueObject.create(service);
    });

    const servicesVacation = order.vacation.services.map((service) => {
      return ServiceValueObject.create(service);
    });

    const status = OrderStatusValueObject.create({ value: order.status });

    const orderMeta = OrderMetaValueObject.create(order.orderMeta);

    const vacation = VacationBooking.create({
      ...order.vacation,
      startDate: DateValueObject.create({
        value: order.vacation.startDate,
      }),
      endDate: DateValueObject.create({
        value: order.vacation.endDate,
      }),
      services: ServiceList.create(servicesVacation),
    });

    const user = UserEntity.create({
      email: order.user.email,
      password: "",
    });

    // const services =

    return OrderEntity.create({
      ...order,
      id: order.id,
      orderKeyId: order.orderKey,
      paymentMethod: order.paymentMethod,
      paymentMethod_title: order.paymentMethod_title,
      dateCreated: DateValueObject.create({
        value: order.dateCreated,
      }),
      dateModified: DateValueObject.create({
        value: order.dateModified,
      }),
      dateImported: DateValueObject.create({
        value: order.dateImported,
      }),
      vacation,
      additionalServices: ServiceList.create(additionalServices),
      status,
      orderMeta,
      user,
    });
  }
}
