import { DataFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CONFIG } from "./admin";
import { isLoggedIn } from "~/utils/helper";

export const loader = async ({ request }: DataFunctionArgs) => {
  await isLoggedIn(request);

  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const name = url.searchParams.get("name");

  invariant(typeof query === "string", "query is required");

  const field = CONFIG.models["Tag"].view.AddForm.fields.find(
    (field) => field.name === name?.toString()
  );

  const options = await field?.onGetOptions?.(query);

  return json({
    items: options || [],
  });
};
