import { Dialog, Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  useFetcher,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import React, { Fragment } from "react";
import { useAlertModal, AlertModal } from "~/components";
import { RocketIcon } from "~/components/icons";
import { useVacationState } from "~/features/orders-sync/store/single-vacation-store";
import { classNames } from "~/utils/helper";

export const VacationSummaryHeader = () => {
  const vacation = useVacationState((store) => store.vacation);
  const alertModalProps = useAlertModal();

  const fetcher = useFetcher();

  const handleClickStatusButton = () => {};
  const handleClickSetAsParentVacation = () => {
    if (vacation.isParent) {
      alertModalProps.open();
    } else {
      fetcher.submit(
        {
          action: "markAsParentVacation",
        },
        {
          method: "POST",
        }
      );
    }
  };

  return (
    <>
      <AlertModal {...alertModalProps}>
        <UnMarkParentVacationModalContent {...alertModalProps} />
      </AlertModal>

      <header className="relative isolate">
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
            <div
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
              style={{
                clipPath:
                  "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
              }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-x-6">
              <img
                src="https://tailwindui.com/img/logos/48x48/tuple.svg"
                alt=""
                className="h-16 w-16 flex-none rounded-full ring-1 ring-gray-900/10"
              />
              <h1>
                <div className="text-sm leading-6 text-gray-500">
                  Vacation{" "}
                  <span className="text-gray-700">{vacation.props.id}</span>
                </div>
                <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                  {vacation.props.name}
                </div>
              </h1>
            </div>

            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <button
                onClick={handleClickSetAsParentVacation}
                className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                {vacation.parentToggleButtonText}
              </button>

              <button
                onClick={handleClickStatusButton}
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white hover:border-black hover:outline-2 hover:outline hover:outline-black hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create
              </button>

              <Menu as="div" className="relative sm:hidden">
                <Menu.Button className="-m-3 block p-3">
                  <span className="sr-only">More</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          // onClick={handleClickCopyUrl}
                          type="button"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900"
                          )}
                        >
                          Copy URL
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const UnMarkParentVacationModalContent = ({
  close,
  cancelButtonRef,
}: // onConfirm,
ReturnType<typeof useAlertModal> & {
  // onConfirm: () => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const vacation = useVacationState((store) => store.vacation);

  const navigation = useNavigation();
  const submit = useSubmit();

  const isSubmittingRef = React.useRef(false);

  React.useEffect(() => {
    if (navigation.state !== "submitting" && isSubmittingRef.current) {
      close();

      searchParams.delete("view");
      setSearchParams(searchParams);

      isSubmittingRef.current = false;
    }
  }, [close, navigation.state, searchParams, setSearchParams]);

  const handleConfirmUnmarkParentVacation = () => {
    isSubmittingRef.current = true;
    submit(
      {
        action: "unMarkAsParentVacation",
        childrenIds: JSON.stringify(vacation.childrenIds),
      },
      {
        method: "POST",
      }
    );
  };

  return (
    <>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationTriangleIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Unmark as parent vacation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to unmark this vacation as parent vacation?
              All the children vacations will be unlinked from this vacation.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
          onClick={handleConfirmUnmarkParentVacation}
        >
          {/* Unmark */}
          {navigation.state !== "idle" ? (
            <>
              <RocketIcon animate={true} />
            </>
          ) : (
            <>Unmark</>
          )}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          onClick={close}
          ref={cancelButtonRef}
        >
          Cancel
        </button>
      </div>
    </>
  );
};
