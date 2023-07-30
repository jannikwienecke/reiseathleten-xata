import { type DataFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CONFIG_ORDERS_PAGE } from "~/features/orders-sync/config";
import { CONFIG } from "~/features/vacation-admin/config";
import { isLoggedIn } from "~/utils/helper";

export const loader = async ({ request, params }: DataFunctionArgs) => {
  await isLoggedIn(request);

  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const name = url.searchParams.get("name");
  const model = url.searchParams.get("model");
  const modelId = url.searchParams.get("modelId");

  invariant(typeof model === "string", "model is required");
  invariant(typeof query === "string", "query is required");
  invariant(typeof name === "string", "name is required");
  invariant(typeof modelId === "string", "modelId is required");

  const field = {
    ...CONFIG.models,
    ...CONFIG_ORDERS_PAGE.models,
  }[model].view.AddForm.fields.find((field) => field.name === name?.toString());

  if (!field) {
    throw new Error(`Field ${name} not found`);
  }

  if (!field.onGetOptions) {
    throw new Error(`Field ${name} does not have onGetOptions method`);
  }

  const options = await field?.onGetOptions?.(query);

  return json({
    // we dont want to show the same model item that we are currently in
    items: options.filter((option) => option.id !== +modelId),
  });
};
