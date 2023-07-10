import type { PrismaClient } from "@prisma/client";
import type { ActivityRepo } from "../activityRepo";

export class ActivityRepoPrisma implements ActivityRepo {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }
  async confirmDate(activityId: number, date: string): Promise<void> {
    await this.client.activityBooking.update({
      where: {
        id: activityId,
      },
      data: {
        datetime: new Date(date),
      },
    });
  }
}
