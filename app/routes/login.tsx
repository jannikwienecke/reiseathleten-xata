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
  return await authenticate(request);
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
