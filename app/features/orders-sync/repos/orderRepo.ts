import { Order } from "@prisma/client";
import { type OrderEntity } from "../domain/order";

export interface OrderRepository {
  save(order: OrderEntity): Promise<void>;
  getLatest(): Promise<Order | null>;
  exists(orderId: number): Promise<boolean>;
  existsByParentOrderId(orderId: number): Promise<boolean>;
}
