import { waitFor } from "~/utils/misc";
import type { ActivityRepo } from "../activityRepo";
import { MOCK_SERVER_URL } from "~/shared/constants/base";

export class ActivityRepoMockServer implements ActivityRepo {
  async confirmDate(activityId: string, date: string): Promise<void> {
    await waitFor(1000);

    await fetch(`${MOCK_SERVER_URL}/vacations/${"1"}/update-activity-date`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityId,
        date,
      }),
    });
  }
}
