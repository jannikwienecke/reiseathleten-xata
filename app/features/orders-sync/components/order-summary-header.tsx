import { Menu, Transition } from "@headlessui/react";
import {
  CalendarDaysIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/20/solid";
import { useSubmit } from "@remix-run/react";
import { Fragment } from "react";
import { useOrderStore } from "~/features/orders-sync/store/vacation-store";
import { classNames } from "~/utils/helper";

export const OrderSummaryHeader = () => {
  const order = useOrderStore((store) => store.order);
  const submit = useSubmit();

  const handleClickCopyUrl = () => {
    navigator.clipboard.writeText(location.href);
  };

  const handleClickStatusButton = () => {
    order.updateStatus();

    submit(
      {
        action: "updateStatus",
        newStatus: order.status.toString(),
      },
      {
        method: "POST",
      }
    );
  };

  return (
    <>
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
                  Order{" "}
                  <span className="text-gray-700">
                    {order.props.orderKeyId}
                  </span>
                </div>
                <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                  {order.props.vacation.props.name}
                </div>

                <div className="flex items-center gap-x-4 pt-2">
                  <div className="flex items-center gap-x-1">
                    <CalendarDaysIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-6 text-gray-500">
                      {order.dispayStartDate} - {order.displayEndDate}
                    </span>
                  </div>
                </div>
              </h1>
            </div>

            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <button
                onClick={handleClickCopyUrl}
                className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Copy URL
              </button>

              <button
                onClick={handleClickStatusButton}
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white hover:border-black hover:outline-2 hover:outline hover:outline-black hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {order.statusButtonText}
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
                          onClick={handleClickCopyUrl}
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
