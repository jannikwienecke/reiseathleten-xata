import type { DataFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "utils/auth.server";

export const loader = ({ request }: DataFunctionArgs) => {
  console.log("LOGIN");

  return {};
};

export const action = async ({ request }: DataFunctionArgs) => {
  console.log("LOGIN ....");

  return authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/signup",
  });
};

export default function Login() {
  const data = useActionData<typeof action>();

  console.log("data: ", data);

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
