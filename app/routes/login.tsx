import type { DataFunctionArgs } from "@remix-run/node";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { authenticate, isLoggedIn } from "~/utils/helper";
import { isError } from "~/utils/misc";

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") || "/";

  await isLoggedIn(request, {
    successRedirect: redirect,
  });

  return {
    data: {},
  };
};

export const action = async ({ request }: DataFunctionArgs) => {
  try {
    await authenticate(request);
    return {};
  } catch (error) {
    if (!isError(error)) throw error;

    const errorString = String(error).toLowerCase();
    if (errorString.includes("password")) {
      return {
        error: error.message,
      };
    } else if (errorString.includes("user not found")) {
      return {
        error: error.message,
      };
    } else {
      throw error;
    }
  }
};

export default function Login() {
  return <AuthForm type="login" />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <GeneralErrorBoundary />;
}
