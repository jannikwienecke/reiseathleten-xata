import { OrderMapper } from "../../mapper/orderMap";
import type { PrismaClient } from "@prisma/client";
import { type OrderEntity } from "../../domain/order";
import { type VacationBookingRepo } from "../vacationRepo";

export class OrderRepoPrisma implements OrderMapper {
  constructor(
    private client: PrismaClient,
    private vacationRepo: VacationBookingRepo // private serviceRepo: ServiceRepoPrisma
  ) {}

  async save(order: OrderEntity): Promise<void> {
    const exists = await this.exists(order.props.id);
    const isNewOrder = !exists;
    const { vacation_id, user_id, ...rawOrder } =
      OrderMapper.toPersistence(order);

    if (isNewOrder) {
      await this.vacationRepo.save(order.props.vacation);

      await this.client.order.create({
        data: {
          ...rawOrder,
          Vacation: {
            connect: {
              id: vacation_id,
            },
          },
          User: {
            connect: {
              id: user_id,
            },
          },
        },
      });
    } else {
      await this.vacationRepo.save(order.props.vacation);
      this.client.order.update({
        where: {
          id: order.props.id,
        },
        data: rawOrder,
      });
    }
  }

  private async exists(orderId: number): Promise<boolean> {
    const order = await this.client.order.findFirst({
      where: {
        id: orderId,
      },
    });

    return !!order;
  }
}
