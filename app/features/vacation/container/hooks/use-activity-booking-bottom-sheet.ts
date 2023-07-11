import { useActionData, useSubmit, useNavigation } from "@remix-run/react";
import React from "react";
import {
  closeAcitivtyModal,
  useVacationStore,
} from "../../store/vacation-store";

export const useActivityBookingBottomSheet = () => {
  // LOCAL STATE
  const [bookTime, setBookTime] = React.useState(false);
  const [activityIsBooked, setActivityIsBooked] = React.useState(false);
  const [showInvalidAlert, setShowInvalidAlert] = React.useState(false);
  const [hasInvalidDate, setHasInvalidDate] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const vacation = useVacationStore((state) => state.vacation);

  //   PARSE ACTION DATA
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const activityHasFixedDate = vacation.pendingActivityHasFixedDate;
  const inputDefaultDate = vacation.startDatePendingActivity;

  const { startDate, endDate } = vacation;

  const minStartDateActivity = startDate;
  minStartDateActivity?.setHours(8, 0, 0, 0);

  const handleClickBookTime = () => {
    setBookTime(true);
  };

  const handleClickConfirm = () => {
    const datetime = inputRef.current?.value ?? "";
    const formData = new FormData();

    formData.append("datetime", datetime);
    formData.append(
      "activityId",
      String(vacation.pendingActivity?.props?.id ?? "")
    );

    submit(formData, {
      method: "post",
    });
  };

  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = new Date(e.target.value).getHours();

    if (hours < 8 || hours > 20) {
      setShowInvalidAlert(true);
      setHasInvalidDate(true);
      e.target.value = "";
    } else {
      setHasInvalidDate(false);
      setShowInvalidAlert(false);
    }
  };

  const handleCloseInvalidAlert = () => {
    setShowInvalidAlert(false);
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
    [actionData?.success, navigation.state]
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
    startDate,
    endDate,
    handleChangeDate,
    minStartDateActivity,
    showInvalidAlert,
    handleCloseInvalidAlert,
    hasInvalidDate,
  };
};
