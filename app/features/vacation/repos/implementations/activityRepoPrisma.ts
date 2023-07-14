import type { PrismaClient } from "@prisma/client";
import type { ActivityRepo } from "../activityRepo";

export class ActivityRepoPrisma implements ActivityRepo {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }
  async confirmDate(vacationActivityId: number, date: string): Promise<void> {
    await this.client.vacationActivity.update({
      where: {
        id: vacationActivityId,
      },
      data: {
        datetime: new Date(date),
      },
    });
  }
}
