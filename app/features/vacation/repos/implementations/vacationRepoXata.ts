import type { XataClient } from "utils/xata";
import type {
  ActivityBookingInterface,
  VacationDtoProps,
} from "../../dto/vacation-dto";
import type { VacationRepo } from "../vacationRepo";

export class VacationRepoXata implements VacationRepo {
  private client: XataClient;

  constructor(client: XataClient) {
    this.client = client;
  }

  async getVacationById(id: string) {
    const vacation = await this.client.db.Vacation.select(["*", "location.*"])
      //   .filter({ user: user?.id })
      .filter({ id })
      .getFirst();

    const activitiesResult = await this.client.db.VacationActivity.select([
      "activity.activity.*",
      "activity.*",
    ])
      .filter({ vacation: vacation?.id })
      .getAll();

    if (!vacation) {
      throw new Error("Vacation not found");
    }

    if (!activitiesResult) {
      throw new Error("Activities not found");
    }

    const tags = await this.client.db.AcivityTag.select([
      "activity.id",
      "tag.*",
      "tag.color.*",
    ]).getAll();

    const activities: ActivityBookingInterface[] = activitiesResult.map((a) => {
      const tagsOfActivity = tags.filter(
        (t) => t.activity?.id === a.activity?.id
      );

      const activity = a.activity;
      if (!activity) {
        throw new Error("Activity not found");
      }
      return {
        ...activity,
        name: activity?.activity?.name || "",
        id: activity?.id || "",
        tags: tagsOfActivity.map((t) => ({
          id: t.tag?.id || "",
          label: t.tag?.label || "",
          color: t.tag?.color?.name || "",
        })),

        isFixedDate: activity?.isFixedDate || false,
        description: activity?.activity?.description || "",
        datetime: activity?.datetime?.toISOString() || undefined,
      };
    });

    const location = vacation.location;

    if (!location) {
      throw new Error("Location not found");
    }

    const dto: VacationDtoProps = {
      location: {
        name: location?.name || "",
        description: location?.description || "",
      },
      vacation: {
        ...vacation,
        endDate: vacation?.endDate?.toISOString() || "",
        startDate: vacation?.startDate?.toISOString() || "",
        description: vacation?.description || "",
      },
      tags: tags.map((t) => ({
        id: t.tag?.id || "",
        label: t.tag?.label || "",
        color: t.tag?.color?.name || "",
      })),
      activities: activities.map((a) => ({
        ...a,
        datetime: a.datetime || undefined,
      })),
    };

    return dto;
  }
}
