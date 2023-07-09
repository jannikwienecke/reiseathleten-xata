import type {
  TagInterface,
  LocationInterface,
  ActivityBookingInterface,
  VacationInterface,
  VacationDtoProps,
} from "~/features/vacation";

const TODAY = new Date();
const TOMORROW = new Date();
TOMORROW.setDate(TODAY.getDate() + 1);
const THE_DAY_AFTER_TOMORROW = new Date();
THE_DAY_AFTER_TOMORROW.setDate(TODAY.getDate() + 2);
const IN_A_WEEK = new Date();
IN_A_WEEK.setDate(TODAY.getDate() + 7);

export const Tags: TagInterface[] = [
  {
    label: "Beach",
    color: "blue",
  },
  {
    label: "City",
    color: "red",
  },
  {
    label: "Nature",
    color: "green",
  },
  {
    label: "Culture",
    color: "yellow",
  },
];

export const Locations: LocationInterface[] = [
  {
    name: "Berlin",
    description: "Capital of Germany",
  },
  {
    name: "Hamburg",
    description: "City in the north of Germany",
  },
  {
    name: "Tenerife",
    description: "Island in the Atlantic Ocean",
  },
  {
    name: "Mallorca",
    description: "Island in the Mediterranean Sea",
  },
];

export const Activities: ActivityBookingInterface[] = [
  {
    id: "1",
    name: "Personal Training",
    description: "Personal Training with a trainer",
    isFixedDate: false,
  },
  {
    id: "2",
    name: "Sightseeing",
    description: "Sightseeing in the city",
    isFixedDate: false,
  },
  {
    id: "3",
    name: "Yoga Session",
    description: "Yoga Session with a trainer",
    isFixedDate: false,
  },
  {
    id: "4",
    name: "Hike the Teide",
    description: "Hike the Teide with a guide",
    isFixedDate: true,
    datetime: TODAY.toISOString(),
  },
  {
    id: "5",
    name: "Visit the Cathedral",
    description: "Visit the Cathedral with a guide",
    isFixedDate: true,
    datetime: TODAY.toISOString(),
  },
];

export const Vacation: VacationInterface = {
  id: "1",
  name: "My Vacation",
  startDate: TODAY.toISOString(),
  endDate: IN_A_WEEK.toISOString(),
  description: "My Vacation Description",
};

export let VACATION_DTO: VacationDtoProps = {
  vacation: Vacation,
  activities: Activities,
  location: Locations[0],
  tags: Tags,
};

export const VACATIONS = [VACATION_DTO];
