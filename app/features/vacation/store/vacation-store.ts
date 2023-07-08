import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { VacationEntity } from "../domain/vacation";
import type { ActivityEntity } from "../domain/activity";

interface BearState {
  vacation: VacationEntity;
  selectedDay: Date;
}

export const useVacationStore = create<BearState>()(
  devtools(
    // persist(
    (set, get) => ({
      vacation: {} as VacationEntity,
      selectedDay: new Date(),
    }),
    {
      name: "vacation-store",
    }
  )
);

export const selectDay = (date: Date) =>
  useVacationStore.setState((state) => ({ selectedDay: date }), false, {
    type: "SELECT_DAY",
    date,
  });

export const selectActivity = (activity: ActivityEntity) => {
  useVacationStore.setState(
    (state) => {
      const vacation = state.vacation;
      vacation.setPendingActivity(activity);
      return { vacation };
    },
    false,
    {
      type: "SELECT_ACTIVITY",
      activity: activity,
    }
  );
};

export const closeAcitivtyModal = () => {
  useVacationStore.setState(
    (state) => {
      const vacation = state.vacation;
      vacation.setPendingActivity(null);
      return { vacation };
    },
    false,
    {
      type: "CLOSE_ACTIVITY_MODAL",
    }
  );
};

export const initVacation = (vacation: VacationEntity) => {
  useVacationStore.setState(
    (state) => {
      return { vacation };
    },
    false,
    {
      type: "INIT_VACATION",
      vacation: vacation,
    }
  );
};
