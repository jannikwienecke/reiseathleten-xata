import { type Order } from "@prisma/client";
import { type OrderEntity } from "../domain/order";

export interface OrderRepository {
  save(order: OrderEntity): Promise<void>;
  getLatest(): Promise<Order | null>;
  exists(orderId: number): Promise<boolean>;
  existsByParentOrderId(orderId: number): Promise<boolean>;
  getById(orderId: number): Promise<OrderEntity | null>;
  updateStatus(orderId: number, status: string): Promise<void>;
}
