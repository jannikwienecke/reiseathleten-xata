import {
  CalendarDaysIcon,
  CreditCardIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { useOrderStore } from "../store/single-order-store";
import { type OrderStatusValueObject } from "../domain/order-status";
import clsx from "clsx";

export const InvoiceSummary = () => {
  const order = useOrderStore((state) => state.order);

  return (
    <>
      <h2 className="sr-only">Summary</h2>
      <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="text-sm font-semibold leading-6 text-gray-900">
              Amount
            </dt>
            <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {order?.price} €
            </dd>
          </div>
          <div className="flex-none self-end px-6 pt-4">
            <dt className="sr-only">Status</dt>
            <StatusBadge />
          </div>
          <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
            <dt className="flex-none">
              <span className="sr-only">Client</span>
              <UserCircleIcon
                className="h-6 w-5 text-gray-400"
                aria-hidden="true"
              />
            </dt>
            <dd className="text-sm font-medium leading-6 text-gray-900">
              {order.username}
            </dd>
          </div>

          <DateItem>
            <time dateTime={order.displayDateCreated}>
              {order.displayDateCreated}
            </time>
            {"  "}
            (order created)
          </DateItem>

          <DateItem>
            <span className="bg-red-100 p-1 rounded-md">
              <time dateTime={order.displayDatePaid}>
                {order.displayDatePaid}
              </time>
              {"  "}({!order.displayDatePaid ? "Not paid yet" : ""})
            </span>
          </DateItem>

          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">Status</span>
              <CreditCardIcon
                className="h-6 w-5 text-gray-400"
                aria-hidden="true"
              />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              {/* Paid with MasterCard */}
              {order.props.paymentMethod} + {order.props.paymentMethod_title}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
          <a
            href="123"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Download receipt <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </>
  );
};

const COLOR_STATUS_MAP: {
  [key in OrderStatusValueObject["props"]["value"]]?: string;
} = {
  completed: "bg-white text-gray-900 ring-gray-900/20",
  paid: "bg-green-50 text-green-600 ring-green-600/20",
  pending: "bg-indigo-50 text-indigo-600 ring-indigo-600/20",
  invoiced: "bg-yellow-50 text-yellow-600 ring-yellow-600/20",
  validated: "bg-blue-50 text-blue-600 ring-blue-600/20",
};

const StatusBadge = () => {
  const order = useOrderStore((state) => state.order);
  const status = order.props.status.value;
  const color = COLOR_STATUS_MAP[status];

  return (
    <>
      <dd
        className={clsx(
          "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
          color
        )}
      >
        {order.statusText}
      </dd>
    </>
  );
};

const DateItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
      <dt className="flex-none">
        <span className="sr-only">date</span>
        <CalendarDaysIcon
          className="h-6 w-5 text-gray-400"
          aria-hidden="true"
        />
      </dt>
      <dd className="text-sm leading-6 text-gray-500">{children}</dd>
    </div>
  );
};
