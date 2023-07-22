import type { Order, PrismaClient } from "@prisma/client";
import { type OrderEntity } from "../../domain/order";
import { OrderMapper } from "../../mapper/orderMap";
import { type OrderRepository } from "../orderRepo";
import { type VacationBookingRepo } from "../vacationRepo";

export class OrderRepoPrisma implements OrderRepository {
  constructor(
    private client: PrismaClient,
    private vacationRepo: VacationBookingRepo // private serviceRepo: ServiceRepoPrisma
  ) {}
  async getLatest(): Promise<Order | null> {
    // get the latest order from the database
    const order = await this.client.order.findFirst({
      orderBy: {
        date_created: "desc",
      },
    });

    return order;
  }

  async save(order: OrderEntity): Promise<void> {
    const exists = await this.exists(order.props.id);
    const isNewOrder = !exists;
    const { vacation_id, user_id, ...rawOrder } =
      OrderMapper.toPersistence(order);

    if (isNewOrder) {
      await this.vacationRepo.save(order.props.vacation);

      const newCreatedOrder = await this.client.order.create({
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

      // we need to create the default activities for this newly created order
      // first get all the default activities for this vacation
      // and then create them for this order
      const defaultActivityIds =
        await this.client.defaultVacationActivity.findMany({
          where: {
            vacationDescriptionId: vacation_id,
          },
          select: {
            activityDescriptionId: true,
          },
        });

      await this.client.orderActivity.createMany({
        data: defaultActivityIds.map((a) => ({
          activityDescriptionId: a.activityDescriptionId,
          order_id: newCreatedOrder.id,
        })),
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

  async exists(orderId: number): Promise<boolean> {
    const order = await this.client.order.findFirst({
      where: {
        id: orderId,
      },
    });

    return !!order;
  }

  async existsByParentOrderId(parentOrderId: number): Promise<boolean> {
    const order = await this.client.order.findFirst({
      where: {
        order_id: parentOrderId,
      },
    });

    return !!order;
  }
}
