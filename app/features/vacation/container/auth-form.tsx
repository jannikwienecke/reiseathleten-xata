import { Form, useActionData, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { RocketIcon } from "~/components/icons";

export function AuthForm({ type }: { type: "login" | "signup" }) {
  const action = useActionData() as
    | {
        error?: string;
      }
    | undefined;

  const isPasswordError = action?.error?.toLowerCase().includes("password");
  const isEmailError =
    action?.error?.toLowerCase().includes("email") ||
    action?.error?.toLowerCase().includes("user not found");

  const navigation = useNavigation();

  const isLoading = navigation.state !== "idle";

  const label = type === "login" ? "Login" : "Sign Up";

  return (
    <div className="h-screen bg-white">
      <div className="flex min-h-full  flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
            {label}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  required
                  className={clsx(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
                    isEmailError && "ring-red-500"
                  )}
                />
              </div>

              {isEmailError ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {action?.error}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  minLength={5}
                  min={5}
                  required
                  className={clsx(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
                    isPasswordError && "ring-red-500"
                  )}
                />
                {isPasswordError ? (
                  <p className="mt-2 text-sm text-red-600" id="password-error">
                    {action?.error}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <button
                disabled={isLoading}
                type="submit"
                className={clsx(
                  "flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white hover:border-2 hover:border-black  hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
                  isLoading && "opacity-70"
                )}
              >
                {!isLoading ? (
                  <>{label}</>
                ) : (
                  <>
                    <RocketIcon animate={true} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm leading-5">
                  <a
                    href={`/${type === "login" ? "signup" : "login"}`}
                    className="font-medium text-black hover:text-gray-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                  >
                    {type === "signup" ? (
                      <>
                        Already have an account?{" "}
                        <span className="text-indigo-500">Login</span>
                      </>
                    ) : (
                      <>
                        Don't have an account?{" "}
                        <span className="text-indigo-500">Sign Up</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
