import { CalendarIcon } from "@heroicons/react/20/solid";
// TODO REMOVE THIS
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "~/components/badge";
import { RocketIcon, SettingsIcon } from "~/components/icons";
import type { ActivityEntity } from "../domain/activity";
import { selectActivity, useVacationStore } from "../store/vacation-store";

export const ActivityList = ({
  activities,
  title,
}: {
  activities: ActivityEntity[];
  title: string;
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
              return (
                <motion.li
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  key={index}
                  className="px-2"
                >
                  <CardItem
                    onClick={() => selectActivity(item)}
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
  activity: ActivityEntity;
}) => {
  const vacation = useVacationStore((state) => state.vacation);

  // date is not set -> user must set it
  const isUnallocated = vacation.getActivityIsUnallocated(activity);
  // date cannot be changed by the user
  const isFixed = vacation.getActivityHasFixedDate(activity);

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      animate={{
        border: isUnallocated
          ? "2px solid #FBBF24"
          : isFixed
          ? "2px solid #374151"
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
