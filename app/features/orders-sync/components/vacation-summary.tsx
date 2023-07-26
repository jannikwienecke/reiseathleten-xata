import { GlobeAsiaAustraliaIcon } from "@heroicons/react/20/solid";
import { useVacationState } from "../store/single-vacation-store";

export const VacationSummary = () => {
  const vacation = useVacationState((state) => state.vacation);

  return (
    <>
      <h2 className="sr-only">Summary</h2>
      <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="text-sm font-semibold leading-6 text-gray-900">
              Price
            </dt>
            <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {vacation?.props.price} €
            </dd>
          </div>
          <div className="flex-none self-end px-6 pt-4">
            <dt className="sr-only">Status</dt>
            {vacation.props.location?.props.name}
          </div>

          <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
            <dt className="flex-none">
              <span className="sr-only">Link</span>
              <GlobeAsiaAustraliaIcon
                className="h-6 w-5 text-gray-400"
                aria-hidden="true"
              />
            </dt>
            <dd className="text-sm font-medium leading-6 text-gray-900">
              <a
                href={vacation.props.permalink}
                className="text-blue-500 hover:text-blue-600"
              >
                {vacation.props.permalink}
              </a>
            </dd>
          </div>

          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dd className="text-sm leading-6 text-gray-500">
              <img src={vacation.props.imageUrl} alt="" />
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
};
