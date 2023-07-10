import invariant from "tiny-invariant";
import { createAction } from "~/utils/stuff.server";
import bcrypt from "bcryptjs";
import { authenticator } from "~/utils/auth.server";

export const signupAction = createAction(async ({ request, repository }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  invariant(email, "email is required");
  invariant(password, "password is required");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await repository.user.signup({
      email,
      password: hashedPassword,
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
