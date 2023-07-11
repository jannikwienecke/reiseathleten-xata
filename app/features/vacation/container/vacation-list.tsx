import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { VacationInterface, VacationsDtoProps } from "../dto/vacation-dto";
import { Link, useNavigation } from "@remix-run/react";
import { RocketIcon } from "~/components/icons";

export const VacationList = ({
  vacations,
}: {
  vacations: VacationsDtoProps;
}) => {
  return (
    <ul className="flex flex-col mt-4">
      {vacations.map((vacation) => (
        <ListItem key={`vacation-${vacation.id}`} vacation={vacation} />
      ))}
    </ul>
  );
};

const ListItem = ({ vacation }: { vacation: VacationInterface }) => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <Link
      to={`/vacations/${vacation.id}`}
      className="flex justify-between py-2 border-b  items-center"
    >
      <div className="flex flex-col justify-between">
        <p className="text-sm font-medium text-black">{vacation.name}</p>
        <p className="text-xs font-medium text-gray-700">
          <span>
            {new Date(vacation.startDate).toDateString()} -{" "}
            {new Date(vacation.endDate).toDateString()}
          </span>
        </p>
      </div>
      <div>
        <button className="text-gray-500 hover:text-gray-700">
          {!isLoading ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <RocketIcon animate={true} />
          )}
        </button>
      </div>
    </Link>
  );
};
