import { type PrismaClient, type VacationDescription } from "@prisma/client";
import { type VacationBooking } from "../../domain/vacation";
import {
  type VacationDescriptionDto,
  VacationDescriptionMap,
} from "../../mapper/vacationDescriptionMap";
import { type VacationBookingRepo } from "../vacationRepo";

export class VacationBookingRepoPrisma implements VacationBookingRepo {
  constructor(private client: PrismaClient) {}

  async save(vacationBooking: VacationBooking): Promise<void> {
    const exists = await this.exists(vacationBooking.props.id);
    const isNewVacationBooking = !exists;
    const rawVacationBooking: VacationDescription =
      VacationDescriptionMap.toPersistence(vacationBooking);

    if (isNewVacationBooking) {
      try {
        await this.client.vacationDescription.create({
          data: rawVacationBooking,
        });
      } catch (error) {
        console.log("-----ERROR-----");
        console.log("RAW VACATION BOOKING: ", rawVacationBooking);
        console.log(rawVacationBooking.name);
        throw error;
      }
    } else {
      await this.client.vacationDescription.update({
        where: {
          id: vacationBooking.props.id,
        },
        data: rawVacationBooking,
      });
    }
  }

  private async exists(vacationBookingId: number): Promise<boolean> {
    const vacationBooking = await this.client.vacationDescription.findFirst({
      where: {
        id: vacationBookingId,
      },
    });

    return !!vacationBooking;
  }

  public async getById(
    vacationBookingId: number
  ): Promise<VacationDescriptionDto> {
    const vacationBooking = await this.client.vacationDescription.findFirst({
      where: {
        id: vacationBookingId,
      },
      include: {
        Location: true,
        VacationServices: {
          include: {
            Service: true,
          },
        },
      },
    });

    return {
      vacationDescription: {
        ...vacationBooking,
        id: vacationBooking?.id || 0,
        name: vacationBooking?.name || "",
        price: vacationBooking?.price || "",
        description: vacationBooking?.description || "",
        image_url: vacationBooking?.image_url || "",
        permalink: vacationBooking?.permalink || "",
        slug: vacationBooking?.slug || "",
        status: vacationBooking?.status || "",
        type: vacationBooking?.type || "",
        date_created: vacationBooking?.date_created || "",
        date_created_gmt: vacationBooking?.date_created_gmt || "",
        date_modified: vacationBooking?.date_modified || "",
        date_modified_gmt: vacationBooking?.date_modified_gmt || "",
        date_imported: vacationBooking?.date_imported || "",
        is_parent: vacationBooking?.is_parent || false,
        locationId: vacationBooking?.locationId || 0,
        location: vacationBooking?.Location
          ? {
              ...vacationBooking?.Location,
              name: vacationBooking?.Location?.name || "",
              description: vacationBooking?.Location?.description || "",
            }
          : undefined,
        services:
          vacationBooking?.VacationServices.map((service) => {
            return {
              ...service,
              name: service.Service.name || "",
              description: service.Service.description || "",
            };
          }) || [],
      },
    };
  }
}
