import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { getXataClient } from "./xata";
import type { User } from "./xata";

import bcrypt from "bcryptjs";

const authenticator = new Authenticator<User>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const xata = getXataClient();
  const user = await xata.db.User.filter({ email }).getFirst();

  console.log("user: ", user);

  if (!user) {
    console.log("wrong email");
    throw new AuthorizationError();
  }

  console.log("password: ", password);

  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string
  );

  console.log("passwordsMatch: ", passwordsMatch);

  if (!passwordsMatch) {
    throw new AuthorizationError();
  }

  return user;
});

authenticator.use(formStrategy, "form");

export { authenticator };
