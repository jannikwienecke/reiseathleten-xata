import { type Order } from "@prisma/client";
import { MOCK_SERVER_URL } from "~/shared/constants/base";
import { type OrderEntity } from "../../domain/order";
import { OrderMapper } from "../../mapper/orderMap";
import { type OrderRepository } from "../orderRepo";

export class OrderRepoMockServer implements OrderRepository {
  async save(order: OrderEntity): Promise<void> {
    const exists = await this.exists(order.props.id);
    const isNewVacationBooking = !exists;

    const rawVacationBooking: Order = OrderMapper.toPersistence(order);

    const method = isNewVacationBooking ? "POST" : "PUT";

    await fetch(`${MOCK_SERVER_URL}/order`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...rawVacationBooking,
      }),
    });
  }

  private async exists(vacationBookingId: number): Promise<boolean> {
    const result = await fetch(`${MOCK_SERVER_URL}/order/${vacationBookingId}`);
    const data = await result.json();
    return !!data.data;
  }
}
