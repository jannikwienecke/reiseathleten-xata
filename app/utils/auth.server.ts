import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";

import { signupAction } from "./helper";
import { User } from "utils/xata";

const authenticator = new Authenticator<User>(sessionStorage);

const formStrategy = new FormStrategy(signupAction);

authenticator.use(formStrategy, "form");

export { authenticator };
