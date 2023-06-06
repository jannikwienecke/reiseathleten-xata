import { redirect, type DataFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
// import { GeneralErrorBoundary } from "~/components/error-boundary.tsx";
// import { prisma } from '~/utils/db.server.ts'
// import { clsx } from 'clsx'
// import { getUserImgSrc } from '~/utils/misc.ts'
import { Dialog, Transition } from "@headlessui/react";
import { addDays, format } from "date-fns";
import { Fragment, useEffect } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import styles from "react-day-picker/dist/style.module.css";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import React from "react";
import { motion } from "framer-motion";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { isLoggedIn } from "~/utils/helper";
import { Activity, Tag, Vacation, Location, getXataClient } from "~/utils/xata";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

const today = new Date();
const tommorow = addDays(today, 1);

const description = `Enjoy a one-on-one personal training session with our top trainer,
Hans. Hans will work with you to develop a personalized training
plan to help you achieve your fitness goals. Duration of the
session is 1 hour. Please arrive 15 minutes before the start of
your session.`;

// const activities: Activity[] = [
//   {
//     id: "1",
//     title: "Yoga Session",
//     description,
//     datetime: new Date().toISOString(),
//     duration: 60,
//     fixedDate: true,
//     tags,
//   },
//   {
//     id: "2",
//     title: "Personal Training",
//     description,
//     // datetime:
//     duration: 60,
//     fixedDate: false,
//     tags: tags.slice(0, 1),
//   },
//   {
//     id: "3",
//     title: "Mount Hiking",
//     description,
//     datetime: new Date().toISOString(),
//     duration: 60,
//     fixedDate: true,
//     tags: tags.slice(1, 2),
//   },
//   {
//     id: "4",
//     title: "Crossfit Session",
//     description,
//     datetime: tommorow.toISOString(),
//     duration: 60,
//     fixedDate: true,
//     tags,
//   },
//   {
//     id: "5",
//     title: "Personal Training 2",
//     description,
//     datetime: tommorow.toISOString(),
//     duration: 60,
//     fixedDate: false,
//     tags,
//   },
//   {
//     id: "6",
//     title: "Best Hiking Tour",
//     description,
//     datetime: tommorow.toISOString(),
//     duration: 60,
//     fixedDate: true,
//     tags,
//   },
//   {
//     id: "7",
//     title: "Best Hiking Tour",
//     description: "Hike to the top of the mountain",
//     datetime: today.toISOString(),
//     duration: 60,
//     fixedDate: true,
//     tags,
//   },
// ];

// const vacation: Vacation = {
//   id: "1",
//   // startDate: new Date().toISOString(),
//   // endDate in 5 days
//   // endDate: addDays(new Date(), 5).toISOString(),
//   locationInfo: {
//     hotelName: "Hotel de la Marine",
//     address: "1 Place de la Concorde",
//     city: "Tenerife",
//     country: "Spain",
//   },
//   contact: {
//     name: "Julian Wienecke",
//     email: "info@reiseathleten.de",
//     phone: "+49 176 12345678",
//   },
//   activity: activities,
//   notes: [],
// };

type TagModel = {
  id: string;
  label: string;
  color: string;
};

type ActivityModel = {
  tags: TagModel[];
  isFixedDate: boolean;
  datetime?: string | null;
  name: string;
  description: string;
  id: string;
};

type VacationModel = {
  activities: ActivityModel[];
  location: Location;
  id: string;
  startDate: Date;
  endDate: Date;
};

export async function loader({ request }: DataFunctionArgs): Promise<{
  vacation: VacationModel;
}> {
  const user = await isLoggedIn(request);

  invariant(user, "User not found");

  const client = getXataClient();

  const vacation = await client.db.Vacation.select(["*", "location.*"])
    .filter({ user: user?.id })
    .getFirst();

  const activitiesResult = await client.db.VacationActivity.select([
    "activity.*",
  ])
    .filter({ vacation: vacation?.id })
    .getAll();

  // console.log({ vacation, activities: activities[0]. });

  if (!vacation) {
    throw new Error("Vacation not found");
  }
  if (!activitiesResult) {
    throw new Error("Activities not found");
  }

  // const activitiyIds = activitiesResult.map((a) => a.activity?.id);

  const tags = await client.db.AcivityTag.select([
    "activity.id",
    "tag.*",
  ]).getAll();

  console.log({ tags });

  const activities: ActivityModel[] = activitiesResult.map((a) => {
    const tagsOfActivity = tags.filter(
      (t) => t.activity?.id === a.activity?.id
    );
    console.log({ tagsOfActivity });

    const activity = a.activity;
    if (!activity) {
      throw new Error("Activity not found");
    }
    return {
      ...activity,
      id: activity?.id || "",
      tags: tagsOfActivity.map((t) => ({
        id: t.tag?.id || "",
        label: t.tag?.label || "",
        color: t.tag?.color || "",
      })),
      isFixedDate: activity?.isFixedDate || false,
      description: activity?.description || "",
      datetime: activity?.datetime?.toISOString() || null,
    };
  });

  const location = vacation.location;

  if (!location) {
    throw new Error("Location not found");
  }

  const vacationResult: VacationModel = {
    ...vacation,
    location,
    activities,
  };

  return { vacation: vacationResult };
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const datetime = formData.get("datetime");
  const activityId = formData.get("activityId");

  invariant(datetime, "datetime is required");
  invariant(activityId, "activityId is required");

  const newPromise3000 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, 1000);
  });

  const date = new Date(datetime.toString());

  //   const promisePrisma = prisma.activityBooking.create({
  //     data: {
  //       date: date,
  //       activityId: activityId.toString(),
  //     },
  //   });

  //   const longestPromise = Promise.race([newPromise3000, promisePrisma]);

  //   await longestPromise;

  return {
    success: true,
  };
}

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>();
  const startDate = new Date(data.vacation.startDate);
  const endDate = new Date(data.vacation.endDate);

  const vacationRange: DateRange = {
    from: startDate,
    to: endDate,
  };

  const [selectedDate, setSelectedDate] = React.useState(startDate);

  const [clickedActivity, setClickedActivity] = React.useState<ActivityModel>();
  const handleClickActivity = (activity: ActivityModel) => {
    setClickedActivity(activity);
  };

  const handleCloseModal = () => {
    setClickedActivity(undefined);
  };

  const handleClickDay = (day: Date) => {
    setSelectedDate(day);
  };

  const handleActivityBooked = (activity: ActivityModel) => {
    setClickedActivity(undefined);
  };

  const activities: ActivityModel[] = data.vacation?.activities || [];
  const activitiesSelectedDay = activities.filter((activity) => {
    if (!activity.datetime) return false;
    const activityDate = new Date(activity.datetime);
    return isSameDay(activityDate, selectedDate);
  });

  const activitiesUnallocated = activities.filter((a) => !a.datetime);

  return (
    <>
      <div className="flex h-full flex-col">
        <Modal onClose={handleCloseModal} isOpen={!!clickedActivity}>
          {clickedActivity ? (
            <ActivityContent
              activity={clickedActivity}
              onClickClose={handleCloseModal}
              onConfirmBookTime={handleActivityBooked}
            />
          ) : null}
        </Modal>

        <div className="mx-4 mt-2 flex flex-row items-center justify-center rounded-2xl bg-gray-700 pb-4 text-white">
          <DayPicker
            // initialFocus={false}
            // initialFocus
            fromMonth={startDate}
            onDayClick={handleClickDay}
            selected={vacationRange}
          />
        </div>

        {activitiesUnallocated.length ? (
          <ActivityList
            title={"Open Activities"}
            activities={activitiesUnallocated}
            onClickActivity={handleClickActivity}
          />
        ) : null}

        <ActivityList
          title={format(selectedDate, "dd.MM.yyyy")}
          activities={activitiesSelectedDay}
          onClickActivity={handleClickActivity}
        />
      </div>
    </>
  );
}

const ActivityList = ({
  activities,
  onClickActivity,
  title,
}: {
  activities: ActivityModel[];
  title: string;
  onClickActivity: (activity: ActivityModel) => void;
}) => {
  return (
    <div className="mx-auto w-full flex-1 pb-2 pl-2 md:container md:rounded-3xl">
      <div className="flex h-full flex-col">
        <div className="flex flex-row items-center space-x-4 px-4 pb-1 pt-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl   bg-purple-200 p-2">
            <RocketIcon />
          </div>
          <h1 className="text-left text-lg font-bold">{title}</h1>
        </div>

        {/* CARD LIST */}

        {activities.length ? (
          <ul className="flex flex-1 flex-col gap-4 overflow-scroll px-2 pt-2">
            {activities.map((item, index) => {
              console.log({ item });

              return (
                <motion.li
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  key={index}
                  className="px-2"
                >
                  <CardItem
                    onClick={() => onClickActivity(item)}
                    key={index}
                    activity={item}
                  />
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="grid h-20 w-20 place-items-center rounded-xl bg-purple-200  p-2 pb-2">
              <RocketIcon />
            </div>
            <p className="text-night-700 text-lg font-bold">No activities</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CardItem = ({
  onClick,
  activity,
}: {
  onClick: () => void;
  activity: ActivityModel;
}) => {
  // date is not set -> user must set it
  const isUnallocated = !activity.datetime;
  // date cannot be changed by the user
  const isFixed = activity.datetime && activity.isFixedDate;
  console.log("==activity", activity.datetime);

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      animate={{
        // nice yellow/orange color if date is not set
        // modern grayisch if date is fixed
        // nice green if date is set but not fixed
        border: isUnallocated
          ? "2px solid #FBBF24"
          : isFixed
          ? // ? "2px solid #E5E7EB"
            // more dark
            "2px solid #374151"
          : "2px solid #10B981",
      }}
      onClick={onClick}
      className="border-night-700 flex w-full flex-col gap-3 rounded-2xl border-[2px] p-2 px-4"
    >
      <div className="flex w-full flex-row  justify-between">
        <h2 className="text-md font-bold">{activity.name}</h2>

        <div>
          <button className="hover:bg-night-700/10 rounded-full p-1">
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* tags */}
      <div className="flex w-full flex-row justify-between gap-2">
        <div className="flex flex-1 flex-row gap-1">
          {activity.tags.map((tag, index) => {
            return (
              <Badge key={index} color={tag.color}>
                {tag.label}
              </Badge>
            );
          })}
        </div>

        {isUnallocated ? (
          <div className="flex flex-1 flex-row justify-center">
            <button className="border-accent-yellow hover:bg-night-700/10 rounded-md border-[2px] p-1 px-2 py-1">
              <p className="text-xs">Book a slot</p>
            </button>
          </div>
        ) : null}
      </div>

      {/* meta */}
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-1">
          <div>
            <CalendarIcon className="h-4 w-4" />
          </div>
          {activity.datetime ? (
            <p className="text-xs ">
              {format(new Date(activity.datetime), "dd MMM yyyy 'at' HH:mm")}{" "}
              {isFixed ? "(Fixed Time)" : ""}
            </p>
          ) : (
            <p className="text-xs ">Not scheduled yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={"h-6 w-6" + className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
      />
    </svg>
  );
};

const RocketIcon = ({ animate }: { animate?: boolean }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="h-6 w-6"
    >
      <motion.path
        initial={{ pathLength: animate ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </motion.svg>
  );
};

const Badge = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => {
  const ColorDict = {
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    indigo: "bg-indigo-100 text-indigo-800",
    gray: "bg-gray-100 text-gray-800",
    night: "bg-night-100 text-night-800",
  };
  const colorClasses =
    ColorDict[color as keyof typeof ColorDict] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`${colorClasses} text-night-700 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10`}
    >
      {children}
    </span>
  );
};

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username "{params.username}" exists</p>
        ),
      }}
    />
  );
}

const ActivityContent = ({
  activity,
  onClickClose,
  onConfirmBookTime,
}: {
  activity: ActivityModel;
  onClickClose: () => void;
  onConfirmBookTime: (activity: ActivityModel) => void;
}) => {
  const [isNew, setIsNew] = React.useState(false);
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isFixed = activity.isFixedDate;
  const inputDefaultDate = activity.datetime
    ? new Date(activity.datetime).toISOString().slice(0, 16)
    : null;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [bookTime, setBookTime] = React.useState(false);
  const handleClickBookTime = () => {
    setBookTime(true);
  };

  const handleClickConfirm = () => {
    if (!activity) return;

    const datetime = inputRef.current?.value ?? "";
    const formData = new FormData();
    console.log("===datetime", datetime);

    formData.append("datetime", datetime);
    formData.append("activityId", activity?.id ?? "");

    submit(formData, {
      method: "post",
    });
  };

  const [booked, setBooked] = React.useState(false);
  const onConfirmBookTimeRef = React.useRef(onConfirmBookTime);
  useEffect(() => {
    console.log({ state: navigation.state });

    if (actionData?.success && navigation.state === "loading") {
      setBooked(true);
      setTimeout(() => {
        onConfirmBookTimeRef.current(activity);
      }, 1000);
    }
  }, [actionData?.success, activity, navigation.state]);

  const isSubmitting = navigation.state === "submitting";

  const currentDate = new Date();
  // format 2023-05-30T12:13
  // local time - not iso!!!
  const day =
    currentDate.getDate() < 10
      ? `0${currentDate.getDate()}`
      : currentDate.getDate();

  const month =
    currentDate.getMonth() + 1 < 10
      ? `0${currentDate.getMonth() + 1}`
      : currentDate.getMonth() + 1;

  console.log({ day });

  const formattedDate = `${currentDate.getFullYear()}-${month}-${day}T${currentDate.getHours()}:${currentDate.getMinutes()}`;

  console.log({ formattedDate });

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
              {/* text about personal training */}
              {activity.description}
            </p>
          </div>
        </div>

        {!isFixed ? (
          <>
            <div className="px-2 pt-4">Please select a day and time</div>

            {inputDefaultDate || bookTime ? (
              <div className="flex w-full flex-row justify-center pt-2">
                <input
                  ref={inputRef}
                  type="datetime-local"
                  className="block w-[75vw] rounded-md border border-gray-300 px-2 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={
                    formattedDate
                    // inputDefaultDate || new Date().toLocaleString().slice(0, 16)
                  }
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

      <div className="mt-5 flex flex-col gap-1 sm:mt-6">
        {!isFixed ? (
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
            ) : booked ? (
              <>
                <CheckIcon animate={true} />
              </>
            ) : (
              <>{bookTime ? "Confirm" : "Book a time"} </>
            )}
          </button>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md bg-indigo-300 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onClickClose}
        >
          Go back to dashboard
        </button>
      </div>
    </>
  );
};

const BottomSheetModal = () => {
  const [expandOnContentDrag, setExpandOnContentDrag] = React.useState(true);
  const focusRef = React.useRef<HTMLButtonElement>(null);
  const sheetRef = React.useRef<BottomSheetRef>(null);

  return (
    <BottomSheet
      open={true}
      skipInitialTransition
      // sibling={<CloseExample className="z-10" />}
      ref={sheetRef}
      initialFocusRef={focusRef}
      defaultSnap={({ maxHeight }) => maxHeight / 2}
      snapPoints={({ maxHeight }) => [
        maxHeight - maxHeight / 10,
        maxHeight / 4,
        maxHeight * 0.6,
      ]}
      expandOnContentDrag={expandOnContentDrag}
    >
      <div className="bg-red-100">
        <div>BOTTOM SHEET</div>
        <button
          onClick={() => {
            // sheetRef.current?.snapTo(0)
            console.log(sheetRef.current?.height);

            sheetRef.current?.snapTo(({ maxHeight }) => {
              return 500;
            });
          }}
        >
          OPEN
        </button>
      </div>
    </BottomSheet>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(isOpen);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          handleClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-500"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const CheckIcon = ({ animate }: { animate: boolean }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      className="h-6 w-6"
    >
      <motion.path
        initial={{
          pathLength: 0,
        }}
        animate={
          animate
            ? {
                scale: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                pathLength: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.98, 0.99, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </motion.svg>
  );
};
