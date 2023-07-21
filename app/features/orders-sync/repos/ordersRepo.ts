import type { RawOrder } from "../api/types";

export interface OrdersRepository {
  getLatest(options: { after?: string }): Promise<RawOrder[]>;
}
