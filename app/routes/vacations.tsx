import { useLoaderData } from "@remix-run/react";
import { Header } from "~/features/vacation/container/header";
import { VacationList } from "~/features/vacation/container/vacation-list";
import {
  type VacationsLoaderData,
  vacationsLoader,
} from "~/features/vacation/server-functions/vacations";

export const loader = vacationsLoader;

export default function Index() {
  const { vacations } = useLoaderData<VacationsLoaderData>();

  return (
    <div>
      <Header />
      <div className="flex flex-col px-4">
        <h1 className="text-2xl  text-black font-bold mt-4 leading-9 tracking-tight">
          Your Vacations
        </h1>

        {vacations.length ? (
          <VacationList vacations={vacations} />
        ) : (
          <div>
            <h1 className="text-lg  text-black mt-4 leading-9 tracking-tight">
              No Vacations booked yet
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
