import { useActionData, useSubmit, useNavigation } from "@remix-run/react";
import React from "react";
import { useVacationStore } from "../../store/vacation-store";

export const useActivityBookingBottomSheet = () => {
  // LOCAL STATE
  const [bookTime, setBookTime] = React.useState(false);
  const [activityIsBooked, setActivityIsBooked] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  //   GLOBAL STATE
  const closeAcitivtyModal = useVacationStore(
    (state) => state.closeAcitivtyModal
  );

  const vacation = useVacationStore((state) => state.vacation);

  //   PARSE ACTION DATA
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const activityHasFixedDate = vacation.pendingActivityHasFixedDate;
  const inputDefaultDate = vacation.startDatePendingActivity;

  const handleClickBookTime = () => {
    setBookTime(true);
  };

  const handleClickConfirm = () => {
    const datetime = inputRef.current?.value ?? "";
    const formData = new FormData();

    formData.append("datetime", datetime);
    formData.append("activityId", vacation.pendingActivity?.props?.id ?? "");

    submit(formData, {
      method: "post",
    });
  };

  React.useEffect(
    function closeAcitivtyModalAfterTimeout() {
      if (actionData?.success && navigation.state === "loading") {
        // we are seeting the local variable to true => activityIsBooked AND
        // we using a timeout so we can show an success animation before closing the modal
        setActivityIsBooked(true);
        setTimeout(closeAcitivtyModal, 1000);
      }
    },
    [actionData?.success, closeAcitivtyModal, navigation.state]
  );

  return {
    bookTime,
    activityIsBooked,
    inputRef,
    activityHasFixedDate,
    inputDefaultDate,
    isSubmitting,
    closeAcitivtyModal,
    handleClickBookTime,
    handleClickConfirm,
  };
};
