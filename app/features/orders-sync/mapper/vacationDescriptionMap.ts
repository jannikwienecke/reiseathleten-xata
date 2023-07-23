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
      locationId: (vacationBooking.props.location?.id as number) || null,
      permalink: vacationBooking.props.permalink,
      slug: vacationBooking.props.slug,
      status: vacationBooking.props.status,
      type: vacationBooking.props.type,
      date_created: vacationBooking.props.dateCreated,
      date_created_gmt: vacationBooking.props.dateCreatedGmt,
      date_modified: vacationBooking.props.dateModified,
      date_modified_gmt: vacationBooking.props.dateModifiedGmt,
      price: vacationBooking.props.price.toString(),
      date_imported: vacationBooking.props.date_imported,
    };
  }
}
