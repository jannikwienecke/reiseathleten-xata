import { type VacationDescription } from "@prisma/client";
import { type VacationBooking } from "../../domain/vacation";
import { VacationDescriptionMap } from "../../mapper/vacationDescriptionMap";
import { type VacationBookingRepo } from "../vacationRepo";
import { MOCK_SERVER_URL } from "~/shared/constants/base";

export class VacationBookingRepoMockServer implements VacationBookingRepo {
  async save(vacationBooking: VacationBooking): Promise<void> {
    const exists = await this.exists(vacationBooking.props.id);
    const isNewVacationBooking = !exists;

    const rawVacationBooking: VacationDescription =
      VacationDescriptionMap.toPersistence(vacationBooking);

    const method = isNewVacationBooking ? "POST" : "PUT";

    await fetch(`${MOCK_SERVER_URL}/vacation-descriptions`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...rawVacationBooking,
      }),
    });
  }

  private async exists(vacationBookingId: number): Promise<boolean> {
    const result = await fetch(
      `${MOCK_SERVER_URL}/vacation-descriptions/${vacationBookingId}`
    );
    const data = await result.json();
    return !!data.data;
  }
}
