import { UserEntity } from "~/features/auth/domain/User";
import { ActivityEvent } from "~/features/orders-sync/domain/activity-event";
import { ActivityEventList } from "~/features/orders-sync/domain/activity-event-list";
import { Mood } from "~/features/orders-sync/domain/mood";
import { OrderEntity } from "~/features/orders-sync/domain/order";
import { OrderMetaValueObject } from "~/features/orders-sync/domain/order-meta";
import { OrderStatusValueObject } from "~/features/orders-sync/domain/order-status";
import { ServiceValueObject } from "~/features/orders-sync/domain/service";
import { ServiceList } from "~/features/orders-sync/domain/service-list";
import { VacationBooking } from "~/features/orders-sync/domain/vacation";
import { DateValueObject } from "~/features/vacation/domain/date";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const serviceAbholung = ServiceValueObject.create({
  name: "Abholung vom Flughafen",
  description: "Wir holen dich vom Flughafen ab",
});

const serviceHalbpension = ServiceValueObject.create({
  name: "Halbpension",
  description: "Leckeres Frühstück und Abendessen",
});

const serviceVollpension = ServiceValueObject.create({
  name: "Vollpension",
  description: "Leckeres Frühstück, Mittagessen und Abendessen",
});

const serviceFitness = ServiceValueObject.create({
  name: "Fitness",
  description: "Fitnessraum mit Geräten und Kursen",
});

const servicesAddional = ServiceList.create([serviceVollpension]);

const activityEvents = ActivityEventList.createCreatedEvent({
  date: DateValueObject.create({ value: yesterday.toISOString() }),
  user: {
    name: "Max Mustermann",
    imageUri: "",
  },
});

const activityEventComment = ActivityEvent.create({
  user: {
    name: "Max Mustermann",
    imageUri: "",
  },
  type: "commented",
  mood: Mood.create({ value: "happy" }),
  content: "This order is super important for us. Please take care of it.",
  date: DateValueObject.create({ value: today.toISOString() }),
});

activityEvents.addEvent(activityEventComment);

export const SINGLE_ORDER = OrderEntity.create({
  additionalServices: servicesAddional,
  dateCreated: DateValueObject.create({ value: yesterday.toISOString() }),
  dateModified: DateValueObject.create({ value: yesterday.toISOString() }),
  dateImported: DateValueObject.create({ value: today.toISOString() }),
  id: 123,
  orderKeyId: "woo_123",
  paymentMethod: "paypal",
  paymentMethod_title: "PayPal",
  orderMeta: OrderMetaValueObject.create({
    addToCommunity: "yes",
    crossfitBox: "Crossfit Berlin",
    knowledgeFrom: "friend",
  }),
  status: OrderStatusValueObject.create({ value: "pending" }),
  user: UserEntity.create({
    email: "max@mustermann.de",
    password: "123",
    id: 99,
  }),
  vacation: VacationBooking.create({
    duration: 3,
    startDate: DateValueObject.create({ value: today.toISOString() }),
    endDate: DateValueObject.create({ value: today.toISOString() }),
    id: 987,
    name: "Fitness Club Vacation Tenerife",
    numberPersons: 2,
    price: 1999,
    roomDescription: "Double Room",
    services: ServiceList.create([
      serviceAbholung,
      serviceFitness,
      serviceHalbpension,
    ]),
    description: "Fitness Club Vacation Tenerife",
    imageUrl: "https://picsum.photos/200",
  }),
  orderId: 123,
  activityEvents,
});
