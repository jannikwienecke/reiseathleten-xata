import type { ActionFunction, DataFunctionArgs } from "@remix-run/node";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import { authenticator } from "~/utils/auth.server";
import { isLoggedIn } from "~/utils/helper";
import { AuthForm } from "~/features/vacation/container/auth-form";
import { prisma } from "~/db.server";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request, { successRedirect: "/" });

  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  console.log("email", email);
  console.log("password", password);

  invariant(email, "email is required");
  invariant(password, "password is required");

  console.log("hier");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    console.log("TRY TO CREATE USER");
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log("OK!!");
  } catch (error) {
    console.log("SOME ERROR!!");
    console.log(error);
  }

  console.log("return..");

  return await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    context: { formData: form },
  });
};

export default function SignUp() {
  return <AuthForm type="signup" />;
}
