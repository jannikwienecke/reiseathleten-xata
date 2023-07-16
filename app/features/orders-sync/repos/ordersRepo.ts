import type { RawOrder } from "../api/types";

export interface OrdersRepository {
  getLatest(): Promise<RawOrder[]>;
}
