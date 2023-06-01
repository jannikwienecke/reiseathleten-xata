import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import type { User } from "./xata";

import { signupAction } from "./helper";

const authenticator = new Authenticator<User>(sessionStorage);

const formStrategy = new FormStrategy(signupAction);

authenticator.use(formStrategy, "form");

export { authenticator };
