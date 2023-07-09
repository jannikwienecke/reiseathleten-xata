import { Dialog } from "@headlessui/react";
import { BottomSheetModal } from "~/components/bottom-sheet-modal";
import { CheckIcon, RocketIcon } from "~/components/icons";
import { getCurrentDateString } from "~/utils/helper";
import type { ActivityEntity } from "../domain/activity";
import { closeAcitivtyModal, useVacationStore } from "../store/vacation-store";
import { useActivityBookingBottomSheet } from "./hooks/use-activity-booking-bottom-sheet";

export const ActivityBookingBottomSheet = () => {
  const selectedActivity = useVacationStore(
    (state) => state.vacation.pendingActivity
  );

  return (
    <BottomSheetModal onClose={closeAcitivtyModal} isOpen={!!selectedActivity}>
      {selectedActivity ? (
        <ActivityContent activity={selectedActivity} />
      ) : null}
    </BottomSheetModal>
  );
};

const ActivityContent = ({ activity }: { activity: ActivityEntity }) => {
  const {
    activityHasFixedDate,
    inputDefaultDate,
    bookTime,
    inputRef,
    handleClickBookTime,
    handleClickConfirm,
    isSubmitting,
    activityIsBooked,
    closeAcitivtyModal,
  } = useActivityBookingBottomSheet();

  return (
    <>
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <RocketIcon />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Personal Training Session with Hans
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {activity.props.description.props.value}
            </p>
          </div>
        </div>

        {!activityHasFixedDate ? (
          <>
            <div className="px-2 pt-4">Please select a day and time</div>

            {inputDefaultDate || bookTime ? (
              <div className="flex w-full flex-row justify-center pt-2">
                <input
                  ref={inputRef}
                  type="datetime-local"
                  className="block w-[75vw] rounded-md border border-gray-300 px-2 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={getCurrentDateString()}
                />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex w-full flex-col justify-center gap-2 px-2 pt-4">
              <p className="text-center">Event Time</p>

              <div className="grid place-items-center">
                <input
                  disabled
                  type="datetime-local"
                  className="block w-[75vw] rounded-md border border-gray-300 px-2  py-1 text-center focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={
                    inputDefaultDate ||
                    new Date().toLocaleDateString().slice(0, 16)
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* CONTROL BUTTONS  */}
      <div className="mt-5 flex flex-col gap-1 sm:mt-6">
        {!activityHasFixedDate ? (
          <button
            disabled={isSubmitting}
            type="button"
            className={`inline-flex w-full justify-center rounded-md ${
              bookTime ? "bg-green-300 " : "bg-yellow-300"
            } px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
            onClick={bookTime ? handleClickConfirm : handleClickBookTime}
          >
            {isSubmitting ? (
              <div className="flex flex-row items-center gap-2">
                <div>
                  <RocketIcon animate={true} />
                </div>
                <div>We are booking your activity...</div>
              </div>
            ) : activityIsBooked ? (
              <CheckIcon animate={true} />
            ) : (
              <>{bookTime ? "Confirm" : "Book a time"} </>
            )}
          </button>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md bg-indigo-300 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={closeAcitivtyModal}
        >
          Go back to dashboard
        </button>
      </div>
    </>
  );
};
