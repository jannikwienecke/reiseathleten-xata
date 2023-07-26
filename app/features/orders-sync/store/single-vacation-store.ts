import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { VacationBooking } from "../domain/vacation";

interface VacationStoreState {
  vacation: VacationBooking;
}

export const useVacationState = create<VacationStoreState>()(
  devtools(
    // persist(
    (set, get) => ({
      vacation: {} as VacationBooking,
    }),
    {
      name: "vacation-store",
    }
  )
);

export const initVacationStore = (vacation: VacationBooking) => {
  useVacationState.setState(
    (state) => {
      return { vacation };
    },
    false,
    {
      type: "INIT_VACATION",
      vacation,
    }
  );
};
