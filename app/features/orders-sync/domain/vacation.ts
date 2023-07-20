import { Entity } from "~/shared/domain/entity";
import { type ServiceList } from "./service-list";
import { type DateValueObject } from "~/features/vacation/domain/date";
import { type LocationEntity } from "./location";

interface VacationBookingProps {
  id: number;
  services: ServiceList;
  startDate: DateValueObject;
  endDate: DateValueObject;
  roomDescription: string;
  price: number;
  numberPersons: number;
  duration: number;
  imageUrl: string;
  name: string;
  description?: string;
  location?: LocationEntity;
}

export class VacationBooking extends Entity<VacationBookingProps> {
  private constructor(props: VacationBookingProps, id?: string) {
    super(props, id);
  }

  static create(props: VacationBookingProps, id?: string) {
    return new VacationBooking(props, id);
  }

  get services() {
    return Object.values(this.props.services.props);
  }
}
