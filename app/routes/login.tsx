import type { DataFunctionArgs } from "@remix-run/node";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { authenticate, isLoggedIn } from "~/utils/helper";
import { waitFor } from "~/utils/misc";

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
  return await authenticate(request);
};

export default function Login() {
  return <AuthForm type="login" />;
}
