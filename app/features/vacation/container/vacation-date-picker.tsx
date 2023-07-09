import React from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import { selectDay, useVacationStore } from "../store/vacation-store";

export const VacationDatePicker = () => {
  const vacation = useVacationStore((state) => state.vacation);

  const vacationRange: DateRange = {
    from: vacation.startDate,
    to: vacation.endDate,
  };

  return (
    <DayPicker
      fromMonth={vacation.startDate}
      onDayClick={selectDay}
      selected={vacationRange}
    />
  );
};
