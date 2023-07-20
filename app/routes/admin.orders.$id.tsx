import {
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
// import { OrderSummary } from "~/features/orders-sync/components/order-summary";
import { LibSliderOver } from "~/utils/lib/react";

// export const loader = syncOrdersLoader;

import { Listbox, Menu, Transition } from "@headlessui/react";
import {
  ArrowsPointingOutIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  UserCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React, { Fragment, useState } from "react";
import { LibForm, Table } from "~/components";
import { UserEntity } from "~/features/auth/domain/User";
import { CONFIG_ORDERS_PAGE } from "~/features/orders-sync/config";
import { OrderEntity } from "~/features/orders-sync/domain/order";
import { OrderMetaValueObject } from "~/features/orders-sync/domain/order-meta";
import { OrderStatusValueObject } from "~/features/orders-sync/domain/order-status";
import { ServiceValueObject } from "~/features/orders-sync/domain/service";
import { ServiceList } from "~/features/orders-sync/domain/service-list";
import { VacationBooking } from "~/features/orders-sync/domain/vacation";
import { OrderMapper } from "~/features/orders-sync/mapper/orderMap";
import {
  initOrder,
  useOrderStore,
} from "~/features/orders-sync/store/vacation-store";
import { DateValueObject } from "~/features/vacation/domain/date";
import { classNames } from "~/utils/helper";
import { createPageFunction } from "~/utils/lib/core";
import { useAdminPage } from "~/utils/lib/hooks";

const navigation = [
  { name: "Home", href: "#" },
  { name: "Invoices", href: "#" },
  { name: "Clients", href: "#" },
  { name: "Expenses", href: "#" },
];
const invoice = {
  subTotal: "$8,800.00",
  tax: "$1,760.00",
  total: "$10,560.00",
  items: [
    {
      id: 1,
      title: "Logo redesign",
      description: "New logo and digital asset playbook.",
      hours: "20.0",
      rate: "$100.00",
      price: "$2,000.00",
    },
    {
      id: 2,
      title: "Website redesign",
      description: "Design and program new company website.",
      hours: "52.0",
      rate: "$100.00",
      price: "$5,200.00",
    },
    {
      id: 3,
      title: "Business cards",
      description: 'Design and production of 3.5" x 2.0" business cards.',
      hours: "12.0",
      rate: "$100.00",
      price: "$1,200.00",
    },
    {
      id: 4,
      title: "T-shirt design",
      description: "Three t-shirt design concepts.",
      hours: "4.0",
      rate: "$100.00",
      price: "$400.00",
    },
  ],
};
const activity = [
  {
    id: 1,
    type: "created",
    person: { name: "Chelsea Hagon" },
    date: "7d ago",
    dateTime: "2023-01-23T10:32",
  },
  {
    id: 2,
    type: "edited",
    person: { name: "Chelsea Hagon" },
    date: "6d ago",
    dateTime: "2023-01-23T11:03",
  },
  {
    id: 3,
    type: "sent",
    person: { name: "Chelsea Hagon" },
    date: "6d ago",
    dateTime: "2023-01-23T11:24",
  },
  {
    id: 4,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: "2023-01-23T15:56",
  },
  {
    id: 5,
    type: "viewed",
    person: { name: "Alex Curren" },
    date: "2d ago",
    dateTime: "2023-01-24T09:12",
  },
  {
    id: 6,
    type: "paid",
    person: { name: "Alex Curren" },
    date: "1d ago",
    dateTime: "2023-01-24T09:20",
  },
];
const moods = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIconMini,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const serviceAbholung = ServiceValueObject.create({
  name: "Abholung vom Flughafen",
  description: "Wir holen dich vom Flughafen ab",
});

const serviceHalbpension = ServiceValueObject.create({
  name: "Halbpension",
  description: "Leckeres Frühstück und Abendessen",
});

const serviceVollpension = ServiceValueObject.create({
  name: "Vollpension",
  description: "Leckeres Frühstück, Mittagessen und Abendessen",
});

const serviceFitness = ServiceValueObject.create({
  name: "Fitness",
  description: "Fitnessraum mit Geräten und Kursen",
});

const servicesAddional = ServiceList.create([serviceVollpension]);

const order = OrderEntity.create({
  additionalServices: servicesAddional,
  dateCreated: DateValueObject.create({ value: today.toISOString() }),
  dateModified: DateValueObject.create({ value: today.toISOString() }),
  dateImported: DateValueObject.create({ value: today.toISOString() }),
  id: 123,
  orderKeyId: "woo_123",
  paymentMethod: "paypal",
  paymentMethod_title: "PayPal",
  orderMeta: OrderMetaValueObject.create({
    addToCommunity: "yes",
    crossfitBox: "Crossfit Berlin",
    knowledgeFrom: "friend",
  }),
  status: OrderStatusValueObject.create({ value: "pending" }),
  user: UserEntity.create({
    email: "max@mustermann.de",
    password: "123",
    id: 99,
  }),
  vacation: VacationBooking.create({
    duration: 3,
    startDate: DateValueObject.create({ value: today.toISOString() }),
    endDate: DateValueObject.create({ value: today.toISOString() }),
    id: 987,
    name: "Fitness Club Vacation Tenerife",
    numberPersons: 2,
    price: 1999,
    roomDescription: "Double Room",
    services: ServiceList.create([serviceAbholung, serviceFitness]),
    description: "Fitness Club Vacation Tenerife",
    imageUrl: "https://picsum.photos/200",
  }),
});

const views = [
  { name: "order_services", label: "Services" },
  { name: "pdf_invoice", label: "Invoice" },
] as const;

type ViewType = typeof views[number];

export const loader = () => {
  return {
    order: OrderMapper.toDto(order),
  };
};

export const pageFunction = createPageFunction({
  config: CONFIG_ORDERS_PAGE,
});

export const action = pageFunction.action;

export default function SyncOrdersPage() {
  const data = useLoaderData<typeof loader>();

  const orderStore = useOrderStore((store) => store.order);

  const { getFormFieldProps, getFormProps, getOverlayProps, addForm } =
    useAdminPage({
      model: "Service",
    });

  React.useEffect(() => {
    if (!order.props) return;
    const orderEntity = OrderMapper.fromDto(data.order);

    initOrder(orderEntity);
  }, [data]);

  if (!data.order) return <div>Not Found</div>;
  if (!orderStore.props) return <div>loading...</div>;

  return (
    <>
      <LibSliderOver {...getOverlayProps()}>
        <LibForm {...getFormProps()}>
          {addForm?.fields.map((field) => {
            return (
              <field.Component {...getFormFieldProps(field)} key={field.name} />
            );
          })}
        </LibForm>
      </LibSliderOver>
      <OrderSummary />
    </>
  );
}

export function OrderSummary() {
  const [selected, setSelected] = useState(moods[5]);

  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view");
  const isFullScreenView = searchParams.get("fullscreen") === "true";

  const isPdfInvoiceView = currentView === "pdf_invoice";

  if (isFullScreenView) {
    return <Pdf />;
  }

  return (
    <>
      <main className="h-full  overflow-scroll">
        <OrderSummaryHeader />

        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-2">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Invoice summary */}
            <div className="lg:col-start-3">
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">
                      Amount
                    </dt>
                    <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
                      $10,560.00
                    </dd>
                  </div>
                  <div className="flex-none self-end px-6 pt-4">
                    <dt className="sr-only">Status</dt>
                    <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                      Paid
                    </dd>
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
                      Alex Curren
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Due date</span>
                      <CalendarDaysIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      <time dateTime="2023-01-31">January 31, 2023</time>
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Status</span>
                      <CreditCardIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      Paid with MasterCard
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Download receipt <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Invoice */}
            <div className="lg:col-span-2 lg:row-span-2 lg:row-start-1 pr-8">
              <div className="pb-2">
                <Tabs />
              </div>
              {isPdfInvoiceView ? (
                <>
                  <PdfViewInvoiceView />
                </>
              ) : (
                <>
                  <div className="pt-12">
                    <ServiceTable />
                  </div>

                  <div className="pt-20">
                    <ServiceTableAdditional />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 lg:col-start-3 lg:row-start-2">
              {/* Activity feed */}
              <h2 className="text-sm font-semibold leading-6 text-gray-900">
                Activity
              </h2>
              <ul className="mt-6 space-y-6">
                {activity.map((activityItem, activityItemIdx) => (
                  <li key={activityItem.id} className="relative flex gap-x-4">
                    <div
                      className={classNames(
                        activityItemIdx === activity.length - 1
                          ? "h-6"
                          : "-bottom-6",
                        "absolute left-0 top-0 flex w-6 justify-center"
                      )}
                    >
                      <div className="w-px bg-gray-200" />
                    </div>
                    {activityItem.type === "commented" ? (
                      <>
                        <img
                          src={activityItem.person.imageUrl}
                          alt=""
                          className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                        />
                        <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                          <div className="flex justify-between gap-x-4">
                            <div className="py-0.5 text-xs leading-5 text-gray-500">
                              <span className="font-medium text-gray-900">
                                {activityItem.person.name}
                              </span>{" "}
                              commented
                            </div>
                            <time
                              dateTime={activityItem.dateTime}
                              className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                            >
                              {activityItem.date}
                            </time>
                          </div>
                          <p className="text-sm leading-6 text-gray-500">
                            {activityItem.comment}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                          {activityItem.type === "paid" ? (
                            <CheckCircleIcon
                              className="h-6 w-6 text-indigo-600"
                              aria-hidden="true"
                            />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                          )}
                        </div>
                        <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                          <span className="font-medium text-gray-900">
                            {activityItem.person.name}
                          </span>{" "}
                          {activityItem.type} the invoice.
                        </p>
                        <time
                          dateTime={activityItem.dateTime}
                          className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                        >
                          {activityItem.date}
                        </time>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* New comment form */}
              <div className="mt-6 flex gap-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                  className="h-6 w-6 flex-none rounded-full bg-gray-50"
                />
                <form action="#" className="relative flex-auto">
                  <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="comment" className="sr-only">
                      Add your comment
                    </label>
                    <textarea
                      rows={2}
                      name="comment"
                      id="comment"
                      className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Add your comment..."
                      defaultValue={""}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex items-center space-x-5">
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                        >
                          <PaperClipIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Attach a file</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <Listbox value={selected} onChange={setSelected}>
                          {({ open }) => (
                            <>
                              <Listbox.Label className="sr-only">
                                Your mood
                              </Listbox.Label>
                              <div className="relative">
                                <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                  <span className="flex items-center justify-center">
                                    {selected.value === null ? (
                                      <span>
                                        <FaceSmileIcon
                                          className="h-5 w-5 flex-shrink-0"
                                          aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                          Add your mood
                                        </span>
                                      </span>
                                    ) : (
                                      <span>
                                        <span
                                          className={classNames(
                                            selected.bgColor,
                                            "flex h-8 w-8 items-center justify-center rounded-full"
                                          )}
                                        >
                                          <selected.icon
                                            className="h-5 w-5 flex-shrink-0 text-white"
                                            aria-hidden="true"
                                          />
                                        </span>
                                        <span className="sr-only">
                                          {selected.name}
                                        </span>
                                      </span>
                                    )}
                                  </span>
                                </Listbox.Button>

                                <Transition
                                  show={open}
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute z-10 -ml-6 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                    {moods.map((mood) => (
                                      <Listbox.Option
                                        key={mood.value}
                                        className={({ active }) =>
                                          classNames(
                                            active ? "bg-gray-100" : "bg-white",
                                            "relative cursor-default select-none px-3 py-2"
                                          )
                                        }
                                        value={mood}
                                      >
                                        <div className="flex items-center">
                                          <div
                                            className={classNames(
                                              mood.bgColor,
                                              "flex h-8 w-8 items-center justify-center rounded-full"
                                            )}
                                          >
                                            <mood.icon
                                              className={classNames(
                                                mood.iconColor,
                                                "h-5 w-5 flex-shrink-0"
                                              )}
                                              aria-hidden="true"
                                            />
                                          </div>
                                          <span className="ml-3 block truncate font-medium">
                                            {mood.name}
                                          </span>
                                        </div>
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </>
                          )}
                        </Listbox>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const ServiceTable = () => {
  const order = useOrderStore((store) => store.order);
  const { model, models, optimisicData, columns } = useAdminPage({
    model: "Service",
  });

  const services = order.standardServices;

  return (
    <>
      <Table
        disableSearch={true}
        compact={true}
        dataList={services.map((service) => {
          return {
            id: 0,
            name: service.props.name,
            description: service.props.description,
          };
        })}
        columns={columns}
        title={"Services"}
      />
    </>
  );
};

const ServiceTableAdditional = () => {
  const order = useOrderStore((store) => store.order);
  const {
    model,
    models,
    optimisicData,
    columns,
    handelClickAdd,
    handelClickDelete,
  } = useAdminPage({
    model: "Service",
  });

  const services = order.additionalServices;

  return (
    <>
      <Table
        onAdd={handelClickAdd}
        onDelete={handelClickDelete}
        disableSearch={true}
        compact={true}
        dataList={services.map((service) => {
          return {
            id: 0,
            name: service.props.name,
            description: service.props.description,
          };
        })}
        columns={columns}
        title={"Additional Service's"}
      />
    </>
  );
};

const OrderSummaryHeader = () => {
  const { location } = useNavigation();
  const order = useOrderStore((store) => store.order);

  const handleClickCopyUrl = () => {
    const url = location?.pathname;

    navigator.clipboard.writeText(url || "");
  };

  const handleClickStatusButton = () => {
    alert(order.statusButtonText);
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
              </h1>
            </div>
            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <button
                onClick={handleClickCopyUrl}
                className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Copy URL
              </button>

              {/* <a
                  href="#"
                  className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
                >
                  Edit
                </a> */}

              {/* button status */}
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
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Edit
                        </a>
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

export function Tabs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChangeTab = (tab: ViewType) => {
    searchParams.set("view", tab.name);
    setSearchParams(searchParams);
  };

  const currentTab = views.find((tab) => tab.name === searchParams.get("view"));

  return (
    <div className="w-1/2">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select View
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
          defaultValue={views.find((tab) => tab.current)?.name}
        >
          {views.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {views.map((tab, tabIdx) => {
            const isCurrent = currentTab
              ? tab.name === currentTab?.name
              : tabIdx === 0;
            return (
              <button
                key={tab.name}
                onClick={() => handleChangeTab(tab)}
                className={classNames(
                  isCurrent
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  tabIdx === 0 ? "rounded-l-lg" : "",
                  tabIdx === views.length - 1 ? "rounded-r-lg" : "",
                  "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                <span>{tab.label}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    isCurrent ? "bg-black" : "bg-transparent",
                    "absolute inset-x-0 bottom-0 h-0.5"
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function PdfViewInvoiceView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleClickFullscreen = () => {
    searchParams.set("fullscreen", "true");
    setSearchParams(searchParams);
  };

  return (
    // width: 21cm;
    // height: 29.7cm;
    <div
      id="pdf-invoice"
      className="relative print:w-[21cm] print:h-[29,7cm] -mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 xl:px-16 xl:pb-20 xl:pt-16"
    >
      <div className="absolute top-4 right-4">
        <button onClick={handleClickFullscreen} aria-label="fullscreen">
          <ArrowsPointingOutIcon className="h-4 w-4" />
        </button>
      </div>

      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Invoice
      </h2>

      <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2 print:grid-cols-2">
        <div className="sm:pr-4">
          <dt className="inline text-gray-500">Issued on</dt>{" "}
          <dd className="inline text-gray-700">
            <time dateTime="2023-23-01">January 23, 2023</time>
          </dd>
        </div>
        <div className="mt-2 sm:mt-0 sm:pl-4">
          <dt className="inline text-gray-500">Due on</dt>{" "}
          <dd className="inline text-gray-700">
            <time dateTime="2023-31-01">January 31, 2023</time>
          </dd>
        </div>
        <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
          <dt className="font-semibold text-gray-900">From</dt>
          <dd className="mt-2 text-gray-500">
            <span className="font-medium text-gray-900">Acme, Inc.</span>
            <br />
            7363 Cynthia Pass
            <br />
            Toronto, ON N3Y 4H8
          </dd>
        </div>
        <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
          <dt className="font-semibold text-gray-900">To</dt>
          <dd className="mt-2 text-gray-500">
            <span className="font-medium text-gray-900">Tuple, Inc</span>
            <br />
            886 Walter Street
            <br />
            New York, NY 12345
          </dd>
        </div>
      </dl>
      <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
        <colgroup>
          <col className="w-full" />
          <col />
          <col />
          <col />
        </colgroup>
        <thead className="border-b border-gray-200 text-gray-900">
          <tr>
            <th scope="col" className="px-0 py-3 font-semibold">
              Projects
            </th>
            <th
              scope="col"
              className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
            >
              Hours
            </th>
            <th
              scope="col"
              className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
            >
              Rate
            </th>
            <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="max-w-0 px-0 py-5 align-top">
                <div className="truncate font-medium text-gray-900">
                  {item.title}
                </div>
                <div className="truncate text-gray-500">{item.description}</div>
              </td>
              <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                {item.hours}
              </td>
              <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                {item.rate}
              </td>
              <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th
              scope="row"
              className="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden"
            >
              Subtotal
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell"
            >
              Subtotal
            </th>
            <td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900">
              {invoice.subTotal}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              className="pt-4 font-normal text-gray-700 sm:hidden"
            >
              Tax
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
            >
              Tax
            </th>
            <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">
              {invoice.tax}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              className="pt-4 font-semibold text-gray-900 sm:hidden"
            >
              Total
            </th>
            <th
              scope="row"
              colSpan={3}
              className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell"
            >
              Total
            </th>
            <td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
              {invoice.total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const Pdf = () => {
  return (
    <>
      {" "}
      <div
        style={{
          width: "21cm",
          height: "29.7cm",
        }}
        className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10"
      >
        <div className="mb-5 pb-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Invoice
            </h2>
          </div>

          <div className="inline-flex gap-x-2">
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
              href="#"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Invoice PDF
            </a>
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
              href="#"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
              </svg>
              Print
            </a>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="grid space-y-3">
              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billed to:
                </dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  <a
                    className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline font-medium"
                    href="#"
                  >
                    sara@site.com
                  </a>
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billing details:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  <span className="block font-semibold">Sara Williams</span>
                  <address className="not-italic font-normal">
                    280 Suzanne Throughway,
                    <br />
                    Breannabury, OR 45801,
                    <br />
                    United States
                    <br />
                  </address>
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Shipping details:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  <span className="block font-semibold">Sara Williams</span>
                  <address className="not-italic font-normal">
                    280 Suzanne Throughway,
                    <br />
                    Breannabury, OR 45801,
                    <br />
                    United States
                    <br />
                  </address>
                </dd>
              </dl>
            </div>
          </div>

          <div>
            <div className="grid space-y-3">
              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Invoice number:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  ADUQ2189H1-0038
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Currency:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  USD - US Dollar
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Due date:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  10 Jan 2023
                </dd>
              </dl>

              <dl className="grid sm:flex gap-x-3 text-sm">
                <dt className="min-w-[150px] max-w-[200px] text-gray-500">
                  Billing method:
                </dt>
                <dd className="font-medium text-gray-800 dark:text-gray-200">
                  Send invoice
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-6 border border-gray-200 p-4 rounded-lg space-y-4 dark:border-gray-700">
          <div className="hidden sm:grid sm:grid-cols-5">
            <div className="sm:col-span-2 text-xs font-medium text-gray-500 uppercase">
              Item
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase">
              Qty
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase">
              Rate
            </div>
            <div className="text-right text-xs font-medium text-gray-500 uppercase">
              Amount
            </div>
          </div>

          <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Design UX and UI
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">5</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $500
              </p>
            </div>
          </div>

          <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Web project
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">24</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $1250
              </p>
            </div>
          </div>

          <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Item
              </h5>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                SEO
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Qty
              </h5>
              <p className="text-gray-800 dark:text-gray-200">1</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Rate
              </h5>
              <p className="text-gray-800 dark:text-gray-200">6</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                Amount
              </h5>
              <p className="sm:text-right text-gray-800 dark:text-gray-200">
                $2000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex sm:justify-end">
          <div className="w-full max-w-2xl sm:text-right space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Subotal:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2750.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Total:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2750.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Tax:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $39.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Amount paid:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $2789.00
                </dd>
              </dl>

              <dl className="grid sm:grid-cols-5 gap-x-3 text-sm">
                <dt className="col-span-3 text-gray-500">Due balance:</dt>
                <dd className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                  $0.00
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      {/* </dd> */}
    </>
  );
};
