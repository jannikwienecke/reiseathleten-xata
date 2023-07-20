import { MOCK_SERVER_URL } from "~/shared/constants/base";
import { waitFor } from "~/utils/misc";
import { orderResultSchema } from "../../api/schema";
import type { RawOrder } from "../../api/types";
import { InvalidSchemaError } from "../../errors/invalid-schema-error";
import type { OrdersRepository } from "../ordersRepo";

export class OrdersRepoMockServer implements OrdersRepository {
  async getLatest(): Promise<RawOrder[]> {
    await waitFor(500);

    const result = await fetch(`${MOCK_SERVER_URL}/orders`);

    const jsonResult = await result.json();
    const jsonParsed = JSON.parse(jsonResult.data);

    const parsedResult = orderResultSchema.safeParse({
      data: jsonParsed,
    });

    if (!parsedResult.success) {
      console.log("-----PARSING MOCK ERROR-----");
      console.log("ORDERS RESULT: ", result);
      console.log("PARSING ERRORS: ", parsedResult.error);
      console.log(" ");

      throw new InvalidSchemaError(`Invalid schema for mock orders`);
    }

    return jsonParsed;
  }
}
