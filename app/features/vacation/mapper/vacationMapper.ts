import { VacationEntity } from "../domain/vacation";
import { LocationEntity } from "../domain/location";
import { TagValueObject } from "../domain/tag";
import { ActivityEntity } from "../domain/activity";
import { DateValueObject } from "../domain/date";
import { ActivityNameValueObject } from "../domain/activity-name";
import { ActivityDescriptionValueObject } from "../domain/activity-description";
import type { VacationDtoProps } from "../dto/vacation-dto";

export class VacationMap {
  public static toDomain({
    location,
    activities,
    vacation,
  }: VacationDtoProps): VacationEntity {
    if (!location) throw new Error("location not found");

    const _location = LocationEntity.create({
      name: location.name || "",
      description: location.description || "",
    });

    const _activities = activities.map((a) =>
      ActivityEntity.create({
        id: a.id,
        datetime: DateValueObject.create({
          value: a.datetime?.toString() || undefined,
        }),
        isFixedDate: a.isFixedDate || false,
        name: ActivityNameValueObject.create({ value: a.name || "" }),
        description: ActivityDescriptionValueObject.create({
          value: a.description || "",
        }),
        tags: a.tags.map((t) =>
          TagValueObject.create({ color: t.color, label: t.label })
        ),
      })
    );

    return VacationEntity.create({
      id: vacation.id,
      startDate: DateValueObject.create({
        value: vacation.startDate.toString(),
      }),
      endDate: DateValueObject.create({ value: vacation.endDate.toString() }),
      location: _location,
      activities: _activities,
    });
  }
}
