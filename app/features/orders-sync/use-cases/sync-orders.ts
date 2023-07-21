import type { RawOrder } from "../api/types";
import { type OrderRepository } from "../repos/orderRepo";
import type { OrdersRepository } from "../repos/ordersRepo";

export class SyncOrdersUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderRepo: OrderRepository
  ) {}

  async execute(): Promise<RawOrder[]> {
    const lastOrder = await this.orderRepo.getLatest();

    const orders = await this.ordersRepository.getLatest({
      after: lastOrder ? lastOrder.date_created.toISOString() : undefined,
    });

    return orders;
  }
}
