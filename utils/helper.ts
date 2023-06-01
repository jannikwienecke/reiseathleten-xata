import { AuthorizationError } from "remix-auth";
import { authenticator } from "./auth.server";
import { getXataClient } from "./xata";
import bcrypt from "bcryptjs";

export const isLoggedIn = async (
  request: Request,
  options?: {
    successRedirect?: string | undefined;
    failureRedirect?: string | undefined;
  }
) => {
  const user = await authenticator.isAuthenticated(
    request,
    options || ({} as any)
  );

  return user;
};

export const authenticate = async (request: Request) => {
  return authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/signup",
  });
};

export const signupAction = async ({ form }: { form: FormData }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const xata = getXataClient();
  const user = await xata.db.User.filter({ email }).getFirst();

  if (!user) {
    console.log("wrong email");
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
};
