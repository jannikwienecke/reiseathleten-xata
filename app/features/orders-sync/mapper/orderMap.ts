import type {
  Location,
  OrderActivityEvents,
  Service,
  User,
  VacationDescription,
  Order,
  Hotel,
  Room,
  AcitivityDescription,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { UserEntity } from "~/features/auth/domain/User";
import { DateValueObject } from "~/features/vacation/domain/date";
import { ActivityEvent } from "../domain/activity-event";
import { ActivityEventList } from "../domain/activity-event-list";
import { LocationEntity } from "../domain/location";
import { Mood } from "../domain/mood";
import { OrderEntity } from "../domain/order";
import { OrderMetaValueObject } from "../domain/order-meta";
import { OrderStatusValueObject } from "../domain/order-status";
import { ServiceValueObject } from "../domain/service";
import { ServiceList } from "../domain/service-list";
import { VacationBooking } from "../domain/vacation";

export class OrderMapper {
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

    const _order: Order = {
      id: order.props.id,
      order_id: order.props.orderId,
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
      hotel_id: order.props?.hotel?.id ?? null,
      room_id: order.props?.room?.id ?? null,
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
        dateCreated: order.props.vacation.props.dateCreated,
        dateModified: order.props.vacation.props.dateModified,
        dateCreatedGmt: order.props.vacation.props.dateCreatedGmt,
        dateModifiedGmt: order.props.vacation.props.dateModifiedGmt,
        type: order.props.vacation.props.type,
        status: order.props.vacation.props.status,
        slug: order.props.vacation.props.slug,
        permalink: order.props.vacation.props.permalink,
        location: order.props.vacation.props.location,
        date_imported: order.props.vacation.props.date_imported,
        isParent: order.props.vacation.props.isParent,
        parentId: order.props.vacation.props.parentId,
        children: order.props.vacation.props.children,
        activities: order.props.vacation.props.activities,
        hotels: order.props.vacation.props.hotels,
        rooms: order.props.vacation.props.rooms,
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

      orderId: order.props.orderId,

      // orderKey
      orderKey: order.props.orderKeyId,

      hotel: order.props.hotel,
      room: order.props.room,

      // activityEvents
      activityEvents: order.props.activityEvents.list.map((event) => ({
        type: event.props.type,
        user: event.props.user,
        date: event.props.date.value?.toISOString() ?? "",
        content: event.props.content ?? "",
        mood: event.props.mood?.props.value ?? null,
      })),
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
      date_imported: order.dateImported,
      dateCreated: order.dateCreated,
      dateModified: order.dateModified,
      dateCreatedGmt: order.dateCreated,
      dateModifiedGmt: order.dateModified,
      hotels: order.vacation.hotels,
      rooms: order.vacation.rooms,
      children: order.vacation.children,
      activities: order.vacation.activities,
    });

    const user = UserEntity.create({
      email: order.user.email,
      password: "",
    });

    const activityEvents = order.activityEvents.map((event) =>
      ActivityEvent.create({
        type: event.type,
        user: event.user,
        date: DateValueObject.create({
          value: event.date,
        }),
        content: event.content,
        mood: Mood.create({ value: event.mood }),
      })
    );

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
      orderId: order.id,
      activityEvents: ActivityEventList.create(activityEvents),
      hotel: order.hotel,
      room: order.room,
    });
  }

  static toDomain(
    order: Order & {
      Hotel?: Hotel;
      Room?: Room;
      OrderActivityEvents: OrderActivityEvents[];
      Vacation: VacationDescription & {
        VacationServices: Service[];
        Location: Location | null;
        Activities: AcitivityDescription[];
      };
    } & {
      User: User;
    }
  ): OrderEntity {
    const additionalServices = JSON.parse(order.additional_services).map(
      (service: ServiceValueObject["props"]) => {
        return ServiceValueObject.create(service);
      }
    );

    const status = OrderStatusValueObject.create({
      value: order.status as OrderStatusValueObject["props"]["value"],
    });

    const orderMeta = OrderMetaValueObject.create({
      crossfitBox: order.crossfit_box ?? "",
      knowledgeFrom: order.knowledge_from,
      addToCommunity: order.add_to_community,
    });

    const services = order.Vacation.VacationServices.map((service) =>
      ServiceValueObject.create(service)
    );

    const vacation = VacationBooking.create({
      ...order.Vacation,
      id: order.vacation_id,
      startDate: DateValueObject.create({
        value: order.start_date.toISOString(),
      }),
      endDate: DateValueObject.create({
        value: order.end_date.toISOString(),
      }),
      duration: order.duration,
      roomDescription: order.room_description,
      price: order.price.toNumber(),
      numberPersons: order.persons,
      imageUrl: "",
      name: order.Vacation.name,
      description: order.Vacation.description ?? "",
      location: order.Vacation.Location
        ? LocationEntity.create({
            ...order.Vacation.Location,
            description: order.Vacation.Location.description ?? "",
          })
        : undefined,
      services: ServiceList.create(services),
      hotels: [],
      rooms: [],

      date_imported: order.date_imported.toISOString(),
      dateCreated: order.date_created.toISOString(),
      dateModified: order.date_modified.toISOString(),
      dateCreatedGmt: order.date_created.toISOString(),
      dateModifiedGmt: order.date_modified.toISOString(),
      isParent: order.Vacation.is_parent,
      parentId: order.Vacation.parent_id,
      children: [],
      type: order.Vacation.type || "",
      status: order.Vacation.status || "",
      slug: order.Vacation.slug || "",
      permalink: order.Vacation.permalink || "",
      activities: order.Vacation.Activities.map((activity) => ({
        ...activity,
        description: activity.description ?? "",
      })),
    });

    const user = UserEntity.create({
      id: order.user_id,
      email: order.User.email,
      password: "",
    });

    // const events = ActivityEvent
    const events = order.OrderActivityEvents.map((event) =>
      ActivityEvent.create({
        ...event,
        mood: Mood.create({ value: event.mood as Mood["props"]["value"] }),
        user: {
          imageUri: "",
          name: order.User.email,
        },
        type: event.type as ActivityEvent["props"]["type"],
        date: DateValueObject.create({
          value: event.date.toISOString(),
        }),
      })
    );

    return OrderEntity.create({
      ...order,
      hotel: order?.Hotel,
      room: order?.Room,
      id: order.id,
      orderKeyId: order.order_key,
      paymentMethod: order.payment_method,
      paymentMethod_title: order.payment_method_title,
      dateCreated: DateValueObject.create({
        value: order.date_created.toISOString(),
      }),
      dateModified: DateValueObject.create({
        value: order.date_modified.toISOString(),
      }),
      dateImported: DateValueObject.create({
        value: order.date_imported.toISOString(),
      }),
      vacation,
      additionalServices: ServiceList.create(additionalServices),
      status,
      orderMeta,
      user,
      orderId: order.id,
      activityEvents: ActivityEventList.create(events),
    });
  }
}
