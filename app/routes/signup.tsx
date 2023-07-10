import type { DataFunctionArgs } from "@remix-run/node";
import { signupAction } from "~/features/auth/server-functions/signup";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { isLoggedIn } from "~/utils/helper";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request, { successRedirect: "/" });

  return {};
};

export const action = signupAction;

export default function SignUp() {
  return <AuthForm type="signup" />;
}
