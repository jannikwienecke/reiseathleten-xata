import type { PrismaClient } from "@prisma/client";
import type { ActivityEventList } from "../../domain/activity-event-list";
import type { OrderActivityEventRepo } from "../orderActivityEventRepo";

export class OrderActivityEventRepoPrisma implements OrderActivityEventRepo {
  constructor(private client: PrismaClient) {}

  async save({
    activityEventList,
    orderId,
    userId,
  }: {
    activityEventList: ActivityEventList;
    orderId: number;
    userId: number;
  }): Promise<void> {
    const promises = activityEventList.newEvents.map(async (event) => {
      await this.client.orderActivityEvents.create({
        data: {
          content: event.content,
          type: event.type,
          date: event.props.date.value?.toISOString(),
          mood: event.mood?.mood || "",
          User: {
            connect: {
              id: userId,
            },
          },

          Order: {
            connect: {
              id: orderId,
            },
          },
        },
      });
    });

    await Promise.all(promises);
  }
}
