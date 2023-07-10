export interface TagInterface {
  label: string;
  color: string;
}

export interface ActivityBookingInterface {
  datetime?: string;
  isFixedDate: boolean;
  description: string;
  name: string;
  id: number;
  tags: TagInterface[];
}

export interface LocationInterface {
  name: string;
  description?: string;
}

export interface VacationInterface {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface VacationDtoProps {
  vacation: VacationInterface;
  activities: ActivityBookingInterface[];
  location: LocationInterface;
}
