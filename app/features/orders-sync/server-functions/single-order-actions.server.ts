import invariant from "tiny-invariant";
import { getFormDataValue } from "~/utils/lib/core";
import type { DataFunctionArgs } from "~/utils/lib/types";
import {
  type Repository,
  type UseCases,
  createAction,
  createLoader,
} from "~/utils/stuff.server";
import { ActivityEvent } from "../domain/activity-event";
import { Mood } from "../domain/mood";
import { DateValueObject } from "~/features/vacation/domain/date";
import { isLoggedIn } from "~/utils/helper";
import { OrderMapper } from "../mapper/orderMap";
import { prisma } from "~/db.server";
import { EventsActivityFeed } from "../components/event-acitivity-feed";
import { OrderActivityEventRepoPrisma } from "../repos/implementations/orderActivityEventRepoPrisma";
import { ActivityEventList } from "../domain/activity-event-list";

type Props = {
  repository: Repository;
  useCases: UseCases;
} & DataFunctionArgs;

export const singleOrderLoaderHandler = async ({
  repository,
  params,
}: Props) => {
  const id = params.id as string;
  invariant(id, "id is required");

  const order = await repository.order.getById(+id);

  if (!order) {
    return {
      order: null,
    };
  }

  return { order: OrderMapper.toDto(order) };
};

export const singleOrderActionHandler = async ({
  useCases,
  repository,
  request,
  params,
}: Props) => {
  const formData = await request.formData();
  const action = getFormDataValue(formData, "action");
  const comment = getFormDataValue(formData, "comment");
  const mood = getFormDataValue(formData, "mood") as Mood["mood"] | undefined;

  console.log({ action });

  const serviceId = getFormDataValue(formData, "serviceName");
  const newStatus = getFormDataValue(formData, "newStatus");
  const hotelId = getFormDataValue(formData, "hotel");
  const roomId = getFormDataValue(formData, "room");

  const serviceIdToDelete = getFormDataValue(formData, "id");

  const orderId = params.id;

  const user = await isLoggedIn(request);

  invariant(user, "user is required");
  invariant(action, "action is required");
  invariant(orderId, "orderId is required");

  const order = await repository.order.getById(+orderId);

  invariant(order, "order is required");

  const handleComment = async () => {
    invariant(comment, "comment is required");

    const newEvent = ActivityEvent.create({
      date: DateValueObject.create({ value: new Date().toISOString() }),
      type: "commented",
      content: comment,
      mood: Mood.create({ value: mood }),
      user: {
        name: user?.props.email,
        imageUri: "test",
      },
    });

    order?.addActivityEvent(newEvent);

    await repository.order.save(order);
  };

  const handleAddAdditionalService = async () => {
    invariant(serviceId, "serviceName is required");

    const service = await repository.vacationServices.getById(+serviceId);

    if (!service) throw new Error(`Service ${serviceId} not found`);

    order.addNewService(service);

    await repository.order.save(order);
  };

  const handleDeleteAdditionalService = async () => {
    invariant(serviceIdToDelete, "id is required");

    order.deleteAdditionalService(+serviceIdToDelete);

    await repository.order.save(order);
  };

  const handleStatusUpdate = async () => {
    invariant(newStatus, "newStatus is required");

    repository.order.updateStatus(+orderId, newStatus);
  };

  const handleAddHotel = async () => {
    invariant(hotelId, "hotelId is required");

    await prisma.order.update({
      where: {
        id: +orderId,
      },
      data: {
        Hotel: {
          connect: {
            id: +hotelId,
          },
        },
      },
    });
  };

  const handleAddRoom = async () => {
    invariant(roomId, "roomId is required");

    await prisma.order.update({
      where: {
        id: +orderId,
      },
      data: {
        Room: {
          connect: {
            id: +roomId,
          },
        },
      },
    });
  };

  const handleAddReminder = async () => {
    // title, description, date

    const title = getFormDataValue(formData, "title") as string;
    const date = getFormDataValue(formData, "date") as string;
    const description = getFormDataValue(formData, "description");

    invariant(user.props.id, "user is required");
    invariant(title, "title is required");
    invariant(date, "date is required");

    await prisma.orderReminder.create({
      data: {
        title,
        description: description || "",
        date: new Date(date),
        Order: {
          connect: {
            id: +orderId,
          },
        },
      },
    });

    const reminderEvent = ActivityEvent.create({
      date: DateValueObject.create({ value: new Date().toISOString() }),
      type: "commented",
      content: `Reminder "${title}" was created: ${description}`,
      user: {
        name: user?.props.email,
        imageUri: "",
      },
    });

    const eventList = ActivityEventList.create([]);
    eventList.addEvent(reminderEvent);

    await repository.orderActivityEventRepo.save({
      activityEventList: eventList,
      orderId: +orderId,
      userId: user.props.id,
    });
  };

  switch (action) {
    case "comment":
      await handleComment();
      break;

    case "addAdditionalService":
      await handleAddAdditionalService();
      break;

    case "deleteAdditionalService":
      await handleDeleteAdditionalService();
      break;

    case "updateStatus":
      await handleStatusUpdate();
      break;

    case "addHotel":
      await handleAddHotel();
      break;

    case "addRoom":
      await handleAddRoom();
      break;

    case "createReminder":
      await handleAddReminder();
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return {};
};

export const singleOrderLoader = createLoader(singleOrderLoaderHandler);
export const singleOrderAction = createAction(singleOrderActionHandler);
