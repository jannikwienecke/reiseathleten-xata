import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { type User, getXataClient, XataClient } from "utils/xata";
import { sessionStorage } from "./session.server";
import { XataApiClient } from "@xata.io/client";
import { prisma } from "~/db.server";

const authenticator = new Authenticator<User>(sessionStorage);

// const formStrategy = new FormStrategy(signupAction);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      console.error("wrong email");
      throw new AuthorizationError();
    }

    const passwordsMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!passwordsMatch) {
      throw new AuthorizationError();
    }

    return {
      ...user,
      id: user.id.toString(),
    };
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "form"
);

export { authenticator };
