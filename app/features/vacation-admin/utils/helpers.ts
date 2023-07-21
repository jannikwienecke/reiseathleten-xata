import { getDateString } from "~/utils/helper";

export const formatDateTimeString = (value: Date) => {
  return value ? getDateString(new Date(value || "")) : "";
};

export const formatDateString = (value: Date) => {
  return value ? getDateString(new Date(value || "")).slice(0, 10) : "";
};

export const getWeekDayString = (day: number) => {
  const dict = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday",
  };

  return dict[day as keyof typeof dict];
};

export const PARENT_BASE_KEY = "base";
export const VACATION_BOOKING_APP_key = "vacation-booking-app";
