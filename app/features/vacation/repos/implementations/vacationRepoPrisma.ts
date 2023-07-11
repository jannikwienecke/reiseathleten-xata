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
      where: {
        userId,
      },
    });

    const vacations: VacationsDtoProps = rawVacations.map((rawVacation) => {
      return {
        ...rawVacation,
        startDate: rawVacation.startDate.toISOString(),
        endDate: rawVacation.endDate.toISOString(),
        description: rawVacation.description || undefined,
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
        Location: true,
        VacationActivity: {
          include: {
            ActivityBooking: {
              include: {
                AcitivityDescription: true,
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
        description: rawVacation.description || undefined,
      },
      location: {
        ...rawVacation.Location,
        description: rawVacation.Location.description || "",
      },
      activities: rawVacation.VacationActivity.map((va) => {
        return {
          ...va.ActivityBooking,
          name: va.ActivityBooking.AcitivityDescription?.name,
          datetime: va.ActivityBooking.datetime?.toISOString(),
          isFixedDate: va.ActivityBooking.isFixedDate,

          description:
            va.ActivityBooking.AcitivityDescription?.description || "",
          tags: va.ActivityBooking.AcitivityTag.map((at) => {
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
