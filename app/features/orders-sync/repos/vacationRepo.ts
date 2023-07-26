import { type VacationBooking } from "../domain/vacation";
import { type VacationDescriptionDto } from "../mapper/vacationDescriptionMap";

export interface VacationBookingRepo {
  save(vacation: VacationBooking): Promise<void>;
  getById(id: number): Promise<VacationDescriptionDto | null>;
}
