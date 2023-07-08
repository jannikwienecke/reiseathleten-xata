import { create, createStore } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { VacationEntity } from "../domain/vacation";
import { ActivityEntity } from "../domain/activity";

interface BearState {
  vacation: VacationEntity;
  initVacation: (vacation: VacationEntity) => void;

  //   ACTIVITY ACTIONS
  //   selectedActivity: ActivityEntity | null;
  selectActivity: (activity: ActivityEntity) => void;
  closeAcitivtyModal: () => void;

  //   day picker
  selectedDay: Date;
  selectDay: (date: Date) => void;
}

export const useVacationStore = create<BearState>()(
  devtools(
    // persist(
    (set, get) => ({
      vacation: {} as VacationEntity,
      initVacation: (vacation: VacationEntity) => set({ vacation }),

      //   ACTIVITY ACTIONS
      selectedActivity: null,
      selectActivity: (activity: ActivityEntity) => {
        const vacation = get().vacation;
        vacation.setPendingActivity(activity);

        set({
          vacation: vacation,
        });
      },

      closeAcitivtyModal: () => {
        const vacation = get().vacation;
        vacation.setPendingActivity(null);

        set({
          vacation: vacation,
        });
      },

      //   day picker
      selectedDay: new Date(),
      selectDay: (date: Date) => set({ selectedDay: date }),
    }),
    {
      name: "vacation-store",
    }
    // )
  )
);
