import { useVacationState } from "../store/single-vacation-store";

export const VacationDescription = () => {
  const vacation = useVacationState((state) => state.vacation);

  if (!vacation.props.description)
    return (
      <div className="text-sm leading-6 text-gray-500">
        No description found
      </div>
    );
  return (
    <>
      <h2 className="sr-only">Vacation Description</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: vacation?.props.description || "",
        }}
      />
    </>
  );
};
