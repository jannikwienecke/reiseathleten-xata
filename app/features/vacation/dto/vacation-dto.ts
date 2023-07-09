export interface TagInterface {
  label: string;
  color: string;
}

export interface ActivityBookingInterface {
  datetime?: string;
  isFixedDate: boolean;
  description: string;
  name: string;
  id: string;
}

export interface LocationInterface {
  name: string;
  description?: string;
}

export interface VacationInterface {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface VacationDtoProps {
  vacation: VacationInterface;
  activities: ActivityBookingInterface[];
  location: LocationInterface;
  tags: TagInterface[];
}
