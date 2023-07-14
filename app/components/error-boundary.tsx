import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { type ErrorResponse } from "@remix-run/router";
import { getErrorMessage, getErrorStack } from "~/utils/misc";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

const DefaultStatusError = ({ error }: { error: ErrorResponse }) => {
  return (
    <>
      <p>
        {error.status} {error.data}
      </p>
    </>
  );
};

const UnexpectedError = ({ error }: { error: unknown }) => {
  console.error("STACK", getErrorStack(error));
  return (
    <>
      <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Unexpected Error
      </h1>
      <p>{getErrorMessage(error)}</p>
    </>
  );
};

export function GeneralErrorBoundary({
  defaultStatusHandler = DefaultStatusError,
  statusHandlers,
  unexpectedErrorHandler = (error) => <UnexpectedError error={error} />,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== "undefined") {
    console.error(error);
  }

  return (
    <div className="h-screen container mx-auto flex flex-col items-center justify-center p-20">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}
