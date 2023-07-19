import { CustomerEntity } from "~/features/auth/domain/Member";
import type { UserEntity } from "~/features/auth/domain/User";
import { DateValueObject } from "~/features/vacation/domain/date";
import { createLoader } from "~/utils/stuff.server";
import { type RawOrder } from "../api/types";
import { OrderEntity } from "../domain/order";
import { OrderMetaValueObject } from "../domain/order-meta";
import { ServiceList } from "../domain/service-list";
import { VacationBooking } from "../domain/vacation";
import { OrderStatusValueObject } from "../domain/order-status";

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

export const syncOrdersLoader = createLoader(
  async ({ useCases, repository }) => {
    async function _handleUserAndCustomerCreation(order: RawOrder) {
      const userExists = await userRepo.hasUserWithEmail(order.billing.email);

      let user: UserEntity | null = null;

      if (!userExists) {
        // create user -> signup
        user = await userRepo.signup({
          email: order.billing.email,
          password: "123456",
        });
      } else {
        user = await userRepo.login({
          email: order.billing.email,
          password: "123456",
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
          password: "123456",
          shipping_address: JSON.stringify(order.shipping),
          birth_date: birthDate ? new Date(birthDate as string) : null,
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

    function _getVacationInfo(order: RawOrder) {
      const lineItem = order.line_items[0];
      const productId = lineItem.product_id;
      const name = lineItem.name;
      const price = lineItem.total;
      const imageUrl = lineItem.image.src;

      const formattedMeta = getFormattedMeta(order);
      const roomDescription = _getRoomDescription(formattedMeta);

      const bookingData = getBookingData(order);
      const { duration, from, to, persons } = getBookingValues(bookingData);

      return VacationBooking.create({
        id: productId,
        name,
        duration,
        price: parseFloat(price),
        roomDescription: roomDescription,
        startDate: DateValueObject.create({ value: from }),
        endDate: DateValueObject.create({ value: to }),
        numberPersons: persons,
        // FIX THIS
        services: [],
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
      let from = "";
      let to = "";
      let persons = 1;
      if (typeof bookingData !== "object")
        return { duration, from, to, persons };

      if ("duration" in bookingData) {
        duration = bookingData?.duration as number;
      }

      if ("from" in bookingData) {
        from = bookingData?.from as string;
      }

      if ("to" in bookingData) {
        to = bookingData?.to as string;
      }

      if ("persons" in bookingData) {
        persons = bookingData?.persons as number;
      }

      return { duration, from, to, persons };
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

    function _getAdditionalServices(order: RawOrder) {
      const servicesString = _getServiceString(getFormattedMeta(order));

      return ServiceList.createServicesFromString(servicesString);
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
        _handleOrderCreation(
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
      const vacation = _getVacationInfo(order);
      const additionalServices = _getAdditionalServices(order);

      const newOrder = OrderEntity.create(
        {
          vacation,
          additionalServices,
          user,
          dateImported: DateValueObject.create({
            value: new Date().toISOString(),
          }),
          dateCreated: DateValueObject.create({ value: order.date_created }),
          dateModified: DateValueObject.create({ value: order.date_modified }),
          orderMeta,
          id: 0,
          orderKeyId: order.order_key,
          paymentMethod: "",
          paymentMethod_title: "",
          status: OrderStatusValueObject.create({ value: "pending" }),
        },
        order.id
      );

      console.log({ newOrder });
      return newOrder;
    }

    const orders = await useCases.syncOrders.execute();

    const userRepo = repository.user;

    const newOrdersPromises = orders.map(async (order) => {
      console.log("======");
      console.log("ORDER: ", order.id);

      const user = await _handleUserAndCustomerCreation(order);
      const newOrder = await _handleOrderCreation({
        user,
        order,
      });

      console.log("SAVE ORDER");
      await repository.order.save(newOrder);

      return newOrder;
    });

    const newOrders = await Promise.all(newOrdersPromises);

    return {
      orders: newOrders,
    };
  }
);
