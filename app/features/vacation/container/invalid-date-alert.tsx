import { Dialog } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { type AlertProps, Alert } from "~/components/alert";

type InvalidDateAlertProps = Omit<AlertProps, "children">;

export const InvalidDateAlert = (props: InvalidDateAlertProps) => {
  return (
    <Alert {...props}>
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationCircleIcon
            className="h-6 w-6 text-red-500"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Invalid Date
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Please select a date between 8am and 8pm
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={props.onClose}
        >
          Go back to the booking page
        </button>
      </div>
    </Alert>
  );
};
