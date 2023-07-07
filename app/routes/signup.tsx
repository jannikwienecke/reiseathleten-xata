import type { ActionFunction, DataFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import { authenticator } from "~/utils/auth.server";
import { isLoggedIn } from "~/utils/helper";
import { getXataClient } from "utils/xata";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request, { successRedirect: "/" });

  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  invariant(email, "email is required");
  invariant(password, "password is required");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const xata = getXataClient();

  await xata.db.User.create({ email, password: hashedPassword });

  // authenticator.authenticate('')
  return await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    context: { formData: form },
  });
};

export default function Login() {
  // useActionData<typeof action>();

  return (
    <div>
      <h1>SIGN UP</h1>

      <Form method="post">
        <label htmlFor="email">Email</label>
        <input type="email" defaultValue={"a@a.de"} name="email" id="email" />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          defaultValue={"1234"}
          name="password"
          id="password"
        />
        <button className="bg-red-300" type="submit">
          SIGN UP
        </button>
      </Form>
    </div>
  );
}
