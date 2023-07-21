import type WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { orderResultSchema } from "../../api/schema";
import type { RawOrder } from "../../api/types";
import { InvalidSchemaError } from "../../errors/invalid-schema-error";
import type { OrdersRepository } from "../ordersRepo";

export class OrdersRepoWooCommerce implements OrdersRepository {
  constructor(private client: WooCommerceRestApi) {}

  async getLatest({ after }: { after?: string }): Promise<RawOrder[]> {
    const result = await this.client.get("orders", {
      per_page: 3,
      after: after || "2023-07-17T00:00:00",
    });

    const parsedResult = orderResultSchema.safeParse(result);

    if (!parsedResult.success) {
      console.log("-----PARSING ERROR-----");
      console.log("ORDERS RESULT: ", result);
      console.log("PARSING ERRORS: ", parsedResult.error);
      console.log(" ");

      throw new InvalidSchemaError(`Invalid schema for orders`);
    }

    return result.data;
  }
}
