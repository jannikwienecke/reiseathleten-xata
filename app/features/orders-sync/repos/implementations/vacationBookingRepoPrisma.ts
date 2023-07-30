import { type PrismaClient, type VacationDescription } from "@prisma/client";
import { prisma } from "~/db.server";
import { type VacationBooking } from "../../domain/vacation";
import {
  type VacationChildren,
  VacationDescriptionMap,
  type VacationDescriptionDto,
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
        DefaultVacationActivity: {
          include: {
            AcitivityDescription: true,
          },
        },
        VacationServices: {
          include: {
            Service: true,
          },
        },
      },
    });

    let children: VacationChildren[] = [];
    if (vacationBooking?.is_parent) {
      const _children = await prisma.vacationDescription.findMany({
        where: {
          parent_id: {
            equals: vacationBookingId,
          },
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

      children = _children.map((child) => {
        return {
          id: child.id,
          name: child.name,
          description: child.description || "",
        };
      });
    }

    return {
      vacationDescription: {
        ...vacationBooking,
        parent_id: vacationBooking?.parent_id || null,
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
        activities:
          vacationBooking?.DefaultVacationActivity.map((activity) => {
            return {
              id: activity.id,
              name: activity.AcitivityDescription.name || "",
              description: activity.AcitivityDescription.description || "",
            };
          }) || [],
        children,
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
              id: service.Service.id,
              name: service.Service.name || "",
              description: service.Service.description || "",
            };
          }) || [],
      },
    };
  }
}
