import type { XataClient } from "utils/xata";
import type { VacationRepo } from "../vacationRepo";
import type { VacationDtoProps } from "../../dto/vacation-dto";
import type { ActivityRepo } from "../activityRepo";

export class ActivityRepoXata implements ActivityRepo {
  private client: XataClient;

  constructor(client: XataClient) {
    this.client = client;
  }
  async confirmDate(activityId: string, date: string): Promise<void> {
    const activity = await this.client.db.ActivityBooking.filter({
      id: activityId,
    }).getFirst();

    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }

    await activity.update({
      datetime: new Date(date).toISOString(),
    });
  }
}
