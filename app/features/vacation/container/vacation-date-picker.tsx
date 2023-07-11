import React from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import { selectDay, useVacationStore } from "../store/vacation-store";

export const VacationDatePicker = () => {
  const vacation = useVacationStore((state) => state.vacation);
  const selectedDay = useVacationStore((state) => state.selectedDay);

  const vacationRange: DateRange = {
    from: vacation.startDate,
    to: vacation.endDate,
  };

  const modifiers = {
    birthday: selectedDay,
  };
  const modifiersStyles = {
    birthday: {
      color: "white",
      backgroundColor: "#ffc107",
    },
  };

  return (
    <DayPicker
      fromMonth={vacation.startDate}
      onDayClick={selectDay}
      selected={vacationRange}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
    />
  );
};
