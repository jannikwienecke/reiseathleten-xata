import { type VacationBooking } from "../domain/vacation";

export interface VacationBookingRepo {
  save(vacation: VacationBooking): Promise<void>;
}
