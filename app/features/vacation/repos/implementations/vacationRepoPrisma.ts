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
    const rawVacations = await this.client.vacation.findMany({
      include: {
        VacationDescription: {
          include: {
            Location: true,
          },
        },
      },
      where: {
        userId,
      },
    });

    const vacations: VacationsDtoProps = rawVacations.map((rawVacation) => {
      return {
        ...rawVacation,
        startDate: rawVacation.startDate.toISOString(),
        endDate: rawVacation.endDate.toISOString(),
        description: rawVacation.VacationDescription.description || undefined,
        name: rawVacation.VacationDescription.name,
      };
    });

    return vacations;
  }

  async getVacationById(id: number, userId: number) {
    const rawVacation = await this.client.vacation.findFirst({
      where: {
        userId,
        id,
      },
      include: {
        VacationDescription: {
          include: {
            Location: true,
          },
        },
        VacationActivity: {
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
                VacationActivity: true,
              },
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
        startDate: rawVacation.startDate.toISOString(),
        endDate: rawVacation.endDate.toISOString(),
        description: rawVacation.VacationDescription.description || undefined,
        name: rawVacation.VacationDescription.name,
      },
      location: {
        ...rawVacation.VacationDescription.Location,
        description: rawVacation.VacationDescription.Location.description || "",
      },
      activities: rawVacation.VacationActivity.map((va) => {
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
}
