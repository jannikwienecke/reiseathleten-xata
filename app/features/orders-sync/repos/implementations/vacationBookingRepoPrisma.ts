import { type PrismaClient, type VacationDescription } from "@prisma/client";
import { type VacationBooking } from "../../domain/vacation";
import { VacationDescriptionMap } from "../../mapper/vacationDescriptionMap";
import { type VacationBookingRepo } from "../vacationRepo";

export class VacationBookingRepoPrisma implements VacationBookingRepo {
  constructor(private client: PrismaClient) {}

  async save(vacationBooking: VacationBooking): Promise<void> {
    const exists = await this.exists(vacationBooking.props.id);
    const isNewVacationBooking = !exists;
    const rawVacationBooking: VacationDescription =
      VacationDescriptionMap.toPersistence(vacationBooking);

    if (isNewVacationBooking) {
      await this.client.vacationDescription.create({
        data: rawVacationBooking,
      });
    } else {
      this.client.vacationDescription.update({
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
}
