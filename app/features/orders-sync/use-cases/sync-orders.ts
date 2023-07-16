import type { RawOrder } from "../api/types";
import type { OrdersRepository } from "../repos/ordersRepo";

export class SyncOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute(): Promise<RawOrder[]> {
    const orders = await this.ordersRepository.getLatest();

    return orders;
  }
}
