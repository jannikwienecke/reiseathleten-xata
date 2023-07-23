import { CustomerEntity } from "~/features/auth/domain/Member";
import { UserEntity } from "~/features/auth/domain/User";
import { DateValueObject } from "~/features/vacation/domain/date";
import { type RawOrder } from "../api/types";
import { OrderEntity } from "../domain/order";
import { OrderMetaValueObject } from "../domain/order-meta";
import { OrderStatusValueObject } from "../domain/order-status";
import type { ServiceValueObject } from "../domain/service";
import { ServiceList } from "../domain/service-list";
import { VacationBooking } from "../domain/vacation";
import { OrderMapper } from "../mapper/orderMap";
import { string } from "zod";
import { Repository, UseCases } from "~/utils/stuff.server";
import { ActivityEventList } from "../domain/activity-event-list";

const KEYS_META = {
  birthDate: "geburtsdatum",
  community: "community",
  knowledgeFrom: "kenntnis",
  crossfit: "crossfit",
} as const;

const KEYS_LINE_ITEM_META = {
  bookingData: "yith_booking_data",
  formattedMeta: "yith_wcbk_formatted_meta",
} as const;

const KEYS_FORMATED_META = {
  service: "Services",
  roomDescription: "Personen",
};

export const syncOrdersUsecase = async ({
  useCases,
  repository,
}: {
  repository: Repository;
  useCases: UseCases;
}) => {
  async function _handleUserAndCustomerCreation(order: RawOrder) {
    const userExists = await userRepo.hasUserWithEmail(order.billing.email);

    let user: UserEntity | null = null;

    const hashedDefaultPassword = await UserEntity.generateDefaultPassword();
    if (!userExists) {
      // create user -> signup
      user = await userRepo.signup({
        email: order.billing.email,
        password: hashedDefaultPassword,
      });
    } else {
      user = await userRepo.login({
        email: order.billing.email,
        password: hashedDefaultPassword,
      });
    }

    if (!user) throw new Error("Cannot create user");

    const customer = await repository.customer.getCustomerByUserId(
      user?.id as number
    );

    const birthDate = order.meta_data.find(
      (meta) => meta.key === KEYS_META.birthDate
    )?.value;

    if (!customer) {
      const customer = CustomerEntity.create({
        ...order.billing,
        user_id: +user.id,
        password: hashedDefaultPassword,
        shipping_address: JSON.stringify(order.shipping),
        birth_date: birthDate as string | null,
      });

      await repository.customer.create(customer);
    }

    return user;
  }

  function _getOrderMeta(order: RawOrder) {
    const knowledgeFrom = order.meta_data.find(
      (meta) => meta.key === KEYS_META.knowledgeFrom
    )?.value as string;

    const addToCommunity = order.meta_data.find(
      (meta) => meta.key === KEYS_META.community
    )?.value as string;

    const crossfitBox = order.meta_data.find(
      (meta) => meta.key === KEYS_META.crossfit
    )?.value as string;

    return OrderMetaValueObject.create({
      knowledgeFrom,
      addToCommunity,
      crossfitBox,
    });
  }

  function getBookingData(order: RawOrder) {
    const lineItem = order.line_items[0];

    return lineItem.meta_data.find(
      (meta) => meta.key === KEYS_LINE_ITEM_META.bookingData
    )?.value;
  }

  async function getServicesForBookingFromDb(
    order: RawOrder
  ): Promise<ServiceList> {
    const lineItem = order.line_items[0];
    const services = await repository.vacationServices.getServicesForVacation(
      lineItem.product_id
    );

    return services;
  }

  async function _getVacationInfo(order: RawOrder) {
    const lineItem = order.line_items[0];
    const productId = lineItem.product_id;
    const name = lineItem.name;
    const price = lineItem.total;
    const imageUrl = lineItem.image.src;

    const formattedMeta = getFormattedMeta(order);
    const roomDescription = _getRoomDescription(formattedMeta);

    const bookingData = getBookingData(order);
    const { duration, from, to, persons } = getBookingValues(bookingData);
    const servicesForVacation = await getServicesForBookingFromDb(order);

    return VacationBooking.create({
      id: productId,
      name,
      duration,
      price: parseFloat(price),
      roomDescription: roomDescription,
      startDate: DateValueObject.create({ value: from }),
      endDate: DateValueObject.create({ value: to }),
      numberPersons: persons,
      services: servicesForVacation,
      imageUrl,
    });
  }

  function getFormattedMeta(order: RawOrder) {
    const lineItem = order.line_items[0];

    const formattedMeta = lineItem.meta_data.find(
      (meta) => meta.key === KEYS_LINE_ITEM_META.formattedMeta
    )?.value;

    return formattedMeta;
  }

  function getBookingValues(bookingData: ReturnType<typeof getBookingData>) {
    let duration = 1;
    let from = 0;
    let to = 0;
    let persons = 1;

    if (typeof bookingData !== "object")
      return { duration, from: "", to: "", persons };

    if ("duration" in bookingData) {
      duration = bookingData?.duration as number;
    }

    if ("from" in bookingData) {
      from = (bookingData?.from as number) * 1000;
    }

    if ("to" in bookingData) {
      to = (bookingData?.to as number) * 1000;
    }

    if ("persons" in bookingData) {
      persons = bookingData?.persons as number;
    }

    return {
      duration,
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
      persons,
    };
  }

  function _getRoomDescription(
    formattedMeta: ReturnType<typeof getFormattedMeta>
  ) {
    if (!Array.isArray(formattedMeta)) return "";

    return formattedMeta.find(
      (meta) => meta.display_key === KEYS_FORMATED_META.roomDescription
    )?.display_value as string;
  }

  function _getServiceString(
    formattedMeta: ReturnType<typeof getFormattedMeta>
  ) {
    if (!Array.isArray(formattedMeta)) return "";

    return formattedMeta.find(
      (meta) => meta.display_key === KEYS_FORMATED_META.service
    )?.display_value as string;
  }

  function getAddtionalServices(order: RawOrder) {
    const servicesString = _getServiceString(getFormattedMeta(order));

    const services = ServiceList.createServicesFromString(servicesString);

    const additionalServices: ServiceValueObject[] = [];

    services.list.forEach((service) => {
      const hasX = service.props.name.toLowerCase().includes("(x");
      const hasUpgrade = service.props.name.toLowerCase().includes("upgrade");

      if (hasX || hasUpgrade) {
        additionalServices.push(service);
      }
    });

    return additionalServices;
  }

  async function _handleOrderCreation(
    {
      user,
      order,
    }: {
      order: RawOrder;
      user: UserEntity;
    },
    lineItemsIndex = 0
  ) {
    const lineItems = order.line_items;

    if (lineItems.length > 1) {
      await _handleOrderCreation(
        {
          user,
          order: {
            ...order,
            line_items: lineItems.slice(lineItemsIndex + 1),
          },
        },
        lineItemsIndex + 1
      );
    }

    const orderMeta = _getOrderMeta(order);
    const additionalServices = getAddtionalServices(order);

    const vacation = await _getVacationInfo(order);

    const dateCreated = DateValueObject.create({ value: order.date_created });

    const activityEvents = ActivityEventList.createCreatedEvent({
      user: {
        name: user.props.email,
        imageUri: "",
      },
      date: dateCreated,
    });

    const newOrder = OrderEntity.create(
      {
        activityEvents,
        vacation,
        additionalServices: ServiceList.create(additionalServices),
        user,
        dateImported: DateValueObject.create({
          value: new Date().toISOString(),
        }),
        dateCreated,
        dateModified: DateValueObject.create({ value: order.date_modified }),
        orderMeta,
        id: lineItems[0].id,
        orderKeyId: order.order_key,
        paymentMethod: "",
        paymentMethod_title: "",
        status: OrderStatusValueObject.create({ value: "pending" }),
        orderId: order.id,
      },
      lineItems[0].id
    );

    await repository.order.save(newOrder);
    newOrders.push(newOrder);
  }

  const orders = await useCases.syncOrders.execute();

  const userRepo = repository.user;

  let newOrders: OrderEntity[] = [];

  const promises = orders.map(async (order) => {
    const exists = await repository.order.existsByParentOrderId(order.id);

    if (exists) {
      return;
    }

    const user = await _handleUserAndCustomerCreation(order);
    await _handleOrderCreation({
      user,
      order,
    });
  });

  await Promise.all(promises);

  return {
    orders: newOrders.map((order) => OrderMapper.toDto(order)),
  };
};
