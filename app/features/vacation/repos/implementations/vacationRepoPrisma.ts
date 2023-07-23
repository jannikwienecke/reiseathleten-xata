import type { PrismaClient } from "@prisma/client";
import type {
  VacationDtoProps,
  VacationsDtoProps,
} from "../../dto/vacation-dto";
import type { VacationRepo } from "../vacationRepo";

export class VacationRepoPrisma implements VacationRepo {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }
  async getVacationsByUserId(userId: number): Promise<VacationsDtoProps> {
    const rawVacations = await this.client.order.findMany({
      include: {
        Vacation: {
          include: {
            Location: true,
          },
        },
      },
      where: {
        user_id: userId,
      },
    });

    const vacations: VacationsDtoProps = rawVacations.map((rawVacation) => {
      return {
        ...rawVacation,
        startDate: rawVacation.start_date.toISOString(),
        endDate: rawVacation.end_date.toISOString(),
        description: rawVacation.Vacation.description || undefined,
        name: rawVacation.Vacation.name,
      };
    });

    return vacations;
  }

  async getVacationById(id: number, userId: number, isAdmin: boolean) {
    const rawVacation = await this.client.order.findFirst({
      where: {
        user_id: isAdmin ? undefined : userId,
        id,
      },
      include: {
        Vacation: {
          include: {
            Location: true,
          },
        },

        OrderActivity: {
          include: {
            AcitivityDescription: {
              include: {
                AcitivityTag: {
                  include: {
                    Tag: {
                      include: {
                        Color: true,
                      },
                    },
                  },
                },
              },
              // VacationActivity: true,
            },
          },
        },
      },
    });

    if (!rawVacation) {
      return null;
    }

    const vacationDto: VacationDtoProps = {
      vacation: {
        ...rawVacation,
        startDate: rawVacation.start_date.toISOString(),
        endDate: rawVacation.end_date.toISOString(),
        description: rawVacation.Vacation.description || "",
        name: rawVacation.Vacation.name,
      },
      location: {
        ...rawVacation.Vacation.Location,
        name: rawVacation.Vacation.Location?.name || "",
        description: rawVacation.Vacation.Location?.description || "",
      },
      activities: rawVacation.OrderActivity.map((va) => {
        return {
          ...va,
          id: va.id,
          name: va.AcitivityDescription.name,
          datetime: va.datetime?.toISOString(),
          isFixedDate: Boolean(va.AcitivityDescription.fixed_day),
          description: va.AcitivityDescription?.description || "",
          tags: va.AcitivityDescription.AcitivityTag.map((at) => {
            return {
              ...at.Tag,
              color: at.Tag.Color.name || "",
            };
          }),
        };
      }),
    };

    return vacationDto;
  }

  async getAllVacations(): Promise<VacationsDtoProps> {
    const rawVacations = await this.client.order.findMany({
      include: {
        Vacation: {
          include: {
            Location: true,
          },
        },
      },
    });

    const vacations: VacationsDtoProps = rawVacations.map((rawVacation) => {
      return {
        ...rawVacation,
        startDate: rawVacation.start_date.toISOString(),
        endDate: rawVacation.end_date.toISOString(),
        description: rawVacation.Vacation.description || undefined,
        name: rawVacation.Vacation.name,
      };
    });

    return vacations;
  }
}
