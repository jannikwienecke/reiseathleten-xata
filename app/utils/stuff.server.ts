// import { DataFunctionArgs } from "@remix-run/node";
// import { getXataClient } from "./xata";
// import { CONFIG } from "~/routes/admin";

// import { redirect } from "@remix-run/node";
import { ActionFunctionArgs, PageHandler } from "./lib/core";

export class AddHandlerServer implements PageHandler {
  async makeRequest(props: ActionFunctionArgs) {
    const { config } = props;

    await config.onAdd(props);

    // return redirect("../");
  }
}
