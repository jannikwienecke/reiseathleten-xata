import type { DataFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getXataClient } from "utils/xata";
import { authenticator } from "~/utils/auth.server";
import { authenticate, isLoggedIn } from "~/utils/helper";

export const loader = async ({ request }: DataFunctionArgs) => {
  // await isLoggedIn(request, {
  //   successRedirect: "/",
  // });

  return {
    data: {},
  };
};

export const action = async ({ request }: DataFunctionArgs) => {
  console.log("LOGIN...");
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  console.log("LOGIN...", email, password);

  try {
    await authenticate(request);
    console.log("Done");
  } catch (error) {
    console.log("Error", error);
  }
};

export default function Login() {
  const data = useActionData<typeof action>();

  return (
    <div>
      <h1>Login</h1>

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
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
