import type { ActionFunction, DataFunctionArgs } from "@remix-run/node";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import { authenticator } from "~/utils/auth.server";
import { isLoggedIn } from "~/utils/helper";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { prisma } from "~/db.server";
import { createAction } from "~/utils/stuff.server";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request, { successRedirect: "/" });

  return {};
};

export const action = createAction(async ({ request, repository }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  invariant(email, "email is required");
  invariant(password, "password is required");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  repository.user.signup({
    email,
    password: hashedPassword,
  });

  return await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    context: { formData: form },
  });
});

export default function SignUp() {
  return <AuthForm type="signup" />;
}
