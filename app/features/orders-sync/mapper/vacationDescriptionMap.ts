import { Location, Service, type VacationDescription } from "@prisma/client";
import { VacationBooking } from "../domain/vacation";
import { LocationEntity } from "../domain/location";
import { ServiceValueObject } from "../domain/service";
import { ServiceList } from "../domain/service-list";
import { DateValueObject } from "~/features/vacation/domain/date";
import { LocationInterface } from "~/features/vacation";

export type VacationDescriptionDto = {
  vacationDescription: VacationDescription & {
    location?: LocationInterface;
    services: ServiceValueObject["props"][];
  };
};

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
      is_parent: vacationBooking.props.isParent,
    };
  }

  public static toDomain({
    vacationDescription,
  }: VacationDescriptionDto): VacationBooking {
    const services = vacationDescription.services.map((service) => {
      return ServiceValueObject.create(service);
    });

    return VacationBooking.create({
      id: vacationDescription.id,
      description: vacationDescription.description || "",
      imageUrl: vacationDescription.image_url || "",
      name: vacationDescription.name,
      location: vacationDescription.location
        ? LocationEntity.create({
            ...vacationDescription.location,
            description: vacationDescription.location.description || "",
          })
        : undefined,
      permalink: vacationDescription.permalink || "",
      slug: vacationDescription.slug || "",
      status: vacationDescription.status || "pending",
      type: vacationDescription.type || "",
      dateCreated: vacationDescription.date_created || "",
      dateCreatedGmt: vacationDescription.date_created_gmt || "",
      dateModified: vacationDescription.date_modified || "",
      dateModifiedGmt: vacationDescription.date_modified_gmt || "",
      price: vacationDescription.price ? +vacationDescription.price : 0,
      date_imported: vacationDescription.date_imported,
      isParent: vacationDescription.is_parent,
      services: ServiceList.create(services),
      duration: 0,
      startDate: DateValueObject.create({ value: "" }),
      endDate: DateValueObject.create({ value: "" }),
      numberPersons: 0,
      roomDescription: "",
    });
  }
}
