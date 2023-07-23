import type { Order, PrismaClient } from "@prisma/client";
import { type OrderEntity } from "../../domain/order";
import { OrderMapper } from "../../mapper/orderMap";
import { type OrderRepository } from "../orderRepo";
import { type VacationBookingRepo } from "../vacationRepo";
import { type OrderActivityEventRepo } from "../orderActivityEventRepo";

export class OrderRepoPrisma implements OrderRepository {
  constructor(
    private client: PrismaClient,
    private vacationRepo: VacationBookingRepo, // private serviceRepo: ServiceRepoPrisma,
    private orderActivityEventRepo: OrderActivityEventRepo
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

      await this.orderActivityEventRepo.save({
        activityEventList: order.props.activityEvents,
        orderId: newCreatedOrder.id,
        userId: user_id,
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
      await this.orderActivityEventRepo.save({
        activityEventList: order.props.activityEvents,
        orderId: order.props.id,
        userId: user_id,
      });

      await this.client.order.update({
        where: {
          id: order.props.id,
        },
        data: rawOrder,
      });
    }
  }

  async exists(orderId: number): Promise<boolean> {
    const order = await this.getById(orderId);

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

  async getById(orderId: number): Promise<OrderEntity | null> {
    const order = await this.client.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        Vacation: {
          include: {
            Location: true,
            VacationServices: {
              include: {
                Service: true,
              },
            },
          },
        },
        User: true,
        OrderActivityEvents: true,
        OrderActivity: {
          include: {
            AcitivityDescription: true,
          },
        },
      },
    });

    if (!order) return null;

    return OrderMapper.toDomain({
      ...order,
      Vacation: {
        ...order.Vacation,
        VacationServices: order.Vacation.VacationServices.map((s) => s.Service),
      },
      OrderActivityEvents: order.OrderActivityEvents,
    });
  }
}
