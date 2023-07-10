import type { DataFunctionArgs } from "@remix-run/node";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { authenticate, isLoggedIn } from "~/utils/helper";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request, {
    successRedirect: "/",
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
