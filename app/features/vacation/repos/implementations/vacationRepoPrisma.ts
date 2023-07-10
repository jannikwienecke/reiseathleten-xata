import type { PrismaClient } from "@prisma/client";
import type { VacationDtoProps } from "../../dto/vacation-dto";
import type { VacationRepo } from "../vacationRepo";

export class VacationRepoPrisma implements VacationRepo {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  async getVacationById(id: number) {
    const vacations = await this.client.vacation.findMany({
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

    const rawVacation = vacations[0];

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
