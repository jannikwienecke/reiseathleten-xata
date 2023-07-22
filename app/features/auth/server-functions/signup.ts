import invariant from "tiny-invariant";
import { authenticator } from "~/utils/auth.server";
import { createAction } from "~/utils/stuff.server";
import { UserEntity } from "../domain/User";

export const signupAction = createAction(async ({ request, repository }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  invariant(email, "email is required");
  invariant(password, "password is required");

  try {
    await repository.user.signup({
      email,
      password: await UserEntity.generatePasswordHash(password),
    });
  } catch (error) {
    const notUnique = "unique constraint failed on the fields";
    if (String(error).toLowerCase().includes(notUnique)) {
      return {
        error: "Email already exists",
      };
    } else {
      throw error;
    }
  }

  return await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    context: { formData: form },
  });
});
