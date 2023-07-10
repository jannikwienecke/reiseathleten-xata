export const VacationNotFound = () => {
  return (
    <div className="h-screen grid place-items-center max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
          No Vacation Found
        </h1>

        <h3 className="mt-2 text-center text-md text-gray-500 mx-4">
          If you think this is an error, please contact your travel agent at{" "}
          <a href="mailto:reiseathleten@gmail.com">Contact</a>
        </h3>
      </div>
    </div>
  );
};
