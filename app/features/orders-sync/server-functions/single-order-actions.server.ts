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

  const serviceId = getFormDataValue(formData, "serviceName");
  const newStatus = getFormDataValue(formData, "newStatus");

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

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return {};
};

export const singleOrderLoader = createLoader(singleOrderLoaderHandler);
export const singleOrderAction = createAction(singleOrderActionHandler);
