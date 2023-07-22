import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { classNames } from "~/utils/helper";
import { useOrderStore } from "../store/vacation-store";
import type { ActivityEvent } from "../domain/activity-event";
import { MOODS } from "./event-activity-form";

const FALLBACK_URL =
  "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

export const EventsActivityFeed = () => {
  const orderStore = useOrderStore((store) => store.order);
  const activityEvents = orderStore?.props.activityEvents;

  return (
    <>
      <h2 className="text-sm font-semibold leading-6 text-gray-900">
        Activity
      </h2>
      <ul className="mt-6 space-y-6">
        {activityEvents.list.map((activityItem, activityItemIdx) => (
          <li
            key={`${activityItemIdx}-${activityItem.type}`}
            className="relative flex gap-x-4"
          >
            <div
              className={classNames(
                activityItemIdx === activityEvents.list.length - 1
                  ? "h-6"
                  : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            {activityItem.type === "commented" ? (
              <CommentActivityEventItem activityItem={activityItem} />
            ) : (
              <ActivityEventItem activityItem={activityItem} />
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

const CommentActivityEventItem = ({
  activityItem,
}: {
  activityItem: ActivityEvent;
}) => {
  const mood = activityItem.mood;
  console.log(activityItem);

  const selected = mood ? MOODS.find((m) => m.value === mood) : MOODS[5];
  console.log(selected);

  return (
    <>
      <img
        src={activityItem.userImageUri || FALLBACK_URL}
        alt=""
        className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
      />
      <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 relative">
        <div className="flex justify-between gap-x-4">
          <div className="py-0.5 text-xs leading-5 text-gray-500">
            <span className="font-medium text-gray-900">
              {activityItem.username}
            </span>{" "}
            commented
          </div>
          <time
            dateTime={activityItem.dateString}
            className="flex-none py-0.5 text-xs leading-5 text-gray-500"
          >
            {activityItem.daysAgo}
          </time>
        </div>
        <p className="text-sm leading-6 text-gray-500">
          {activityItem.content}
        </p>

        {selected?.icon ? (
          <div className="-bottom-2 right-0 absolute">
            <span
              className={classNames(
                selected?.bgColor,
                "flex h-8 w-8 items-center justify-center rounded-full"
              )}
            >
              <selected.icon
                className="h-5 w-5 flex-shrink-0 text-white"
                aria-hidden="true"
              />
            </span>
            <span className="sr-only">{selected?.name}</span>
          </div>
        ) : null}
      </div>
    </>
  );
};

const ActivityEventItem = ({
  activityItem,
}: {
  activityItem: ActivityEvent;
}) => {
  return (
    <>
      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
        {activityItem.type === "paid" ? (
          <CheckCircleIcon
            className="h-6 w-6 text-green-600"
            aria-hidden="true"
          />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
        )}
      </div>
      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
        <span className="font-medium text-gray-900">
          {activityItem.username}
        </span>{" "}
        {activityItem.type} the order.
      </p>
      <time
        dateTime={activityItem.dateString}
        className="flex-none py-0.5 text-xs leading-5 text-gray-500"
      >
        {activityItem.daysAgo}
      </time>
    </>
  );
};
