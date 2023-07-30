import { Entity } from "~/shared/domain/entity";
import { type ServiceList } from "./service-list";
import { type DateValueObject } from "~/features/vacation/domain/date";
import { type LocationEntity } from "./location";
import { type VacationChildren } from "../mapper/vacationDescriptionMap";

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
  slug: string;
  permalink: string;
  dateCreated: string;
  dateCreatedGmt: string;
  dateModified: string;
  dateModifiedGmt: string;
  type: string;
  status: string;
  location?: LocationEntity;
  date_imported: string;
  isParent: boolean;
  parentId: number | null;
  children: VacationChildren[];
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

  get isParent() {
    return this.props.isParent;
  }

  get parentToggleButtonText() {
    return this.props.isParent ? "Unset Parent" : "Make parent";
  }

  get childrenIds() {
    return this.props.children.map((child) => child.id);
  }
}
