import bcrypt from "bcryptjs";
import { AuthorizationError } from "remix-auth";
import { prisma } from "~/db.server";
import { authenticator } from "./auth.server";

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
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") || "/";

  await authenticator.authenticate("form", request, {
    successRedirect: redirect,
    throwOnError: true,
  });
};

export const signupAction = async ({ form }: { form: FormData }) => {
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
