import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import bcrypt from "bcryptjs";
import { signupAction } from "./helper";
import { User, getXataClient } from "utils/xata";

const authenticator = new Authenticator<User>(sessionStorage);

// const formStrategy = new FormStrategy(signupAction);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string;
    let password = form.get("password") as string;

    const xata = getXataClient();
    const user = await xata.db.User.filter({ email }).getFirst();

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

    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "form"
);

export { authenticator };
