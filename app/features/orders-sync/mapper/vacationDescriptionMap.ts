import { type VacationDescription } from "@prisma/client";
import { type VacationBooking } from "../domain/vacation";

export class VacationDescriptionMap {
  public static toPersistence(
    vacationBooking: VacationBooking
  ): VacationDescription {
    return {
      id: vacationBooking.props.id,
      description: vacationBooking.props.description || "",
      image_url: vacationBooking.props.imageUrl,
      name: vacationBooking.props.name,
      //  FIX THIS
      locationId: 1,
    };
  }
}
