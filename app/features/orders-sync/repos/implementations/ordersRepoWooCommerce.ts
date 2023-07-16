import type WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import type { RawOrder } from "../../api/types";
import type { OrdersRepository } from "../ordersRepo";
import { orderResultSchema } from "../../api/schema";
import { InvalidSchemaError } from "../../errors/invalid-schema-error";

export class OrdersRepoWooCommerce implements OrdersRepository {
  private client: WooCommerceRestApi;
  constructor(client: WooCommerceRestApi) {
    this.client = client;
  }

  async getLatest(): Promise<RawOrder[]> {
    const result = await this.client.get("orders", {
      per_page: 1,
    });

    const parsedResult = orderResultSchema.safeParse(result);

    if (!parsedResult.success) {
      console.log("-----PARSING ERROR-----");
      console.log("ORDERS RESULT: ", result);
      console.log("PARSING ERRORS: ", parsedResult.error);
      console.log(" ");

      throw new InvalidSchemaError(`Invalid schema for orders`);
    }

    return parsedResult.data.data;
  }
}
