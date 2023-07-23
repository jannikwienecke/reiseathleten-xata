import type WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { productResponseSchema } from "../../api/schema";
import type { RawProduct } from "../../api/types";
import { InvalidSchemaError } from "../../errors/invalid-schema-error";
import { type ProductsRepository } from "../productsRepo";

export class ProductsRepoWooCommerce implements ProductsRepository {
  constructor(private client: WooCommerceRestApi) {}

  async getLatest({
    offset,
    limit,
    after,
  }: {
    offset?: number;
    limit?: number;
    after?: string;
  }): Promise<RawProduct[]> {
    const result = await this.client.get("products", {
      per_page: limit || 10,
      offset: offset || 0,
      after: after ? after : undefined,
    });

    const parsedResult = productResponseSchema.safeParse(result);

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
