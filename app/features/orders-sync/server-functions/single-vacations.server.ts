import invariant from "tiny-invariant";
import type { DataFunctionArgs } from "~/utils/lib/types";
import {
  createAction,
  createLoader,
  type Repository,
  type UseCases,
} from "~/utils/stuff.server";
import { type VacationDescriptionDto } from "../mapper/vacationDescriptionMap";
import { request } from "@playwright/test";
import { isLoggedIn } from "~/utils/helper";
import { getFormDataValue } from "~/utils/lib/core";
import { Mood } from "../domain/mood";
import { prisma } from "~/db.server";

type Props = {
  repository: Repository;
  useCases: UseCases;
} & DataFunctionArgs;

export const singleVacationLoaderHandler = async ({
  repository,
  params,
}: Props): Promise<VacationDescriptionDto> => {
  const id = params.id as string;
  invariant(id, "id is required");

  const vacation = await repository.vacationBooking.getById(+id);

  if (!vacation) throw new Error("Vacation not found");

  return vacation;
};

export const singleVacationActionHandler = async ({
  repository,
  params,
  request,
}: Props) => {
  const id = params.id as string;
  invariant(id, "id is required");
  const formData = await request.formData();
  const action = getFormDataValue(formData, "action");
  const serviceId = getFormDataValue(formData, "serviceName");

  const orderId = params.id;

  const user = await isLoggedIn(request);

  invariant(user, "user is required");
  invariant(action, "action is required");
  invariant(orderId, "orderId is required");

  const handleAddService = async () => {
    invariant(serviceId, "serviceId is required");

    await prisma.vacationServices.create({
      data: {
        Service: {
          connect: {
            id: +serviceId,
          },
        },
        Vacation: {
          connect: {
            id: +id,
          },
        },
      },
    });
  };

  const handleMarkAsParentVacation = async () => {
    console.log("SET AS PARENT");

    await prisma.vacationDescription.update({
      where: {
        id: +id,
      },
      data: {
        is_parent: true,
      },
    });
  };

  switch (action) {
    case "addService":
      await handleAddService();
      break;

    case "markAsParentVacation":
      await handleMarkAsParentVacation();
      break;

    default:
      throw new Error("Action not found" + action);
  }

  // const vacation = await repository.vacationBooking.getById(+id);

  // if (!vacation) throw new Error("Vacation not found");

  return {};
};

export const singleVacationLoader = createLoader(singleVacationLoaderHandler);
export const singleVacationAction = createAction(singleVacationActionHandler);
