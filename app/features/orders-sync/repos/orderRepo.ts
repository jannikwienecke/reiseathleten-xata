import { type OrderEntity } from "../domain/order";

export interface OrderRepository {
  save(order: OrderEntity): Promise<void>;
}
