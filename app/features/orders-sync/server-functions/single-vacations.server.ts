import invariant from "tiny-invariant";
import type { DataFunctionArgs } from "~/utils/lib/types";
import {
  createAction,
  createLoader,
  type Repository,
  type UseCases,
} from "~/utils/stuff.server";
import { type VacationDescriptionDto } from "../mapper/vacationDescriptionMap";
import { isLoggedIn } from "~/utils/helper";
import { getFormDataValue } from "~/utils/lib/core";
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
  const vacationId = getFormDataValue(formData, "vacation");
  const formId = getFormDataValue(formData, "id");
  const childrenIds = getFormDataValue(formData, "childrenIds");

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
    await prisma.vacationDescription.update({
      where: {
        id: +id,
      },
      data: {
        is_parent: true,
      },
    });
  };

  const handleUnmarkAsParentVacation = async () => {
    invariant(childrenIds, `Action ${action}: childrenIds is required`);

    const childrenIdsArray = JSON.parse(childrenIds);

    await prisma.vacationDescription.update({
      where: {
        id: +id,
      },
      data: {
        is_parent: false,
      },
    });

    const promises = childrenIdsArray.map(async (childId: number) => {
      return prisma.vacationDescription.update({
        where: {
          id: childId,
        },
        data: {
          parent_id: null,
        },
      });
    });

    await Promise.all(promises);
  };

  const handleAddChildVacation = async () => {
    invariant(vacationId, `Action ${action}: vacationId is required`);

    await prisma.vacationDescription.update({
      where: {
        id: +vacationId,
      },
      data: {
        parent_id: +id,
      },
    });
  };

  // deleteChildVacation
  const handleDeleteChildVacation = async () => {
    invariant(formId, `Action ${action}: formId is required`);

    await prisma.vacationDescription.update({
      where: {
        id: +formId,
      },
      data: {
        parent_id: null,
      },
    });
  };

  // deleteAdditionalService
  const handleDeleteVacationService = async () => {
    invariant(formId, `Action ${action}: formId is required`);

    const service = await prisma.vacationServices.findFirst({
      where: {
        service_id: +formId,
      },
    });

    console.log({ service });

    service?.id &&
      (await prisma.vacationServices.delete({
        where: {
          id: service.id,
        },
      }));
  };

  switch (action) {
    case "addService":
      await handleAddService();
      break;

    case "markAsParentVacation":
      await handleMarkAsParentVacation();
      break;

    case "unMarkAsParentVacation":
      await handleUnmarkAsParentVacation();
      break;

    case "addChildVacation":
      await handleAddChildVacation();
      break;

    case "deleteChildVacation":
      await handleDeleteChildVacation();
      break;

    case "deleteVacationService":
      await handleDeleteVacationService();
      break;

    default:
      throw new Error("Action not found: " + action);
  }

  // const vacation = await repository.vacationBooking.getById(+id);

  // if (!vacation) throw new Error("Vacation not found");

  return {};
};

export const singleVacationLoader = createLoader(singleVacationLoaderHandler);
export const singleVacationAction = createAction(singleVacationActionHandler);
