import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "~/db.server";
import { type MemberEntity } from "~/features/auth/domain/Member";
import { UserRepoMock } from "~/features/auth/repos/implementations/userRepoMockServer";
import { UserRepoPrisma } from "~/features/auth/repos/implementations/userRepoPrisma";
import type { UserRepo } from "~/features/auth/repos/userRepo";
import { IS_PRODUCTION } from "~/shared/constants/base";
import { waitFor } from "./misc";
import { sessionStorage } from "./session.server";

const authenticator = new Authenticator<MemberEntity>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const userRepo: UserRepo = IS_PRODUCTION
      ? new UserRepoPrisma(prisma)
      : new UserRepoMock();

    const userPromise = userRepo.login({ email, password });

    const [user] = await Promise.all([userPromise, waitFor(1000)]);

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    const passwordsMatch = await bcrypt.compare(
      password,
      user.props.password as string
    );

    if (!passwordsMatch) {
      throw new AuthorizationError("Password is incorrect");
    }

    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "form"
);

export { authenticator };
