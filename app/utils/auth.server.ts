import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { type User } from "utils/xata";
import { prisma } from "~/db.server";
import { UserRepoMock } from "~/features/auth/repos/implementations/userRepoMockServer";
import { UserRepoPrisma } from "~/features/auth/repos/implementations/userRepoPrisma";
import type { UserRepo } from "~/features/auth/repos/userRepo";
import { IS_PRODUCTION } from "~/shared/constants/base";
import { sessionStorage } from "./session.server";
import { waitFor } from "./misc";

const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const userRepo: UserRepo = IS_PRODUCTION
      ? new UserRepoPrisma(prisma)
      : new UserRepoMock();

    const userPromise = userRepo.login({ email, password });

    const [user] = await Promise.all([userPromise, waitFor(1000)]);

    if (!user) throw new AuthorizationError();

    const passwordsMatch = await bcrypt.compare(
      password,
      user.props.password as string
    );

    if (!passwordsMatch) throw new AuthorizationError();

    return {
      ...user,
      id: user.props.id.toString(),
    };
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "form"
);

export { authenticator };
