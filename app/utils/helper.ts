import { AuthorizationError } from "remix-auth";
import { authenticator } from "./auth.server";
import bcrypt from "bcryptjs";
import { getXataClient } from "utils/xata";

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
  await authenticator.authenticate("form", request, {
    successRedirect: "/vacation",
    // failureRedirect: "/signup",
    throwOnError: true,
  });
};

export const signupAction = async ({ form }: { form: FormData }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

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
};

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const getCurrentDateString = () => {
  const currentDate = new Date();

  const values = [
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
  ];

  const parsedValues = values.map((v) => (v < 10 ? `0${v}` : v));
  const [year, month, day, hours, minutes] = parsedValues;
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

  return formattedDate;
};
