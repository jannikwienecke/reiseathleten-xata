import { Entity } from "~/shared/domain/entity";
import type { LocationEntity } from "./location";
import type { ActivityEntity } from "./activity";
import type { DateValueObject } from "./date";
import { fromJSON } from "postcss";
import { Vacation } from "utils/xata";

interface VacationProps {
  activities: ActivityEntity[];
  location: LocationEntity;
  id: string;
  startDate: DateValueObject;
  endDate: DateValueObject;
}

export class VacationEntity extends Entity<VacationProps> {
  private _pendingActivity: ActivityEntity | null = null;

  private constructor(props: VacationProps, id?: string) {
    super(props, id);
  }

  static create(props: VacationProps, id?: string) {
    return new VacationEntity(props, id);
  }

  get startDate() {
    return this.props.startDate.value;
  }

  get endDate() {
    return this.props.endDate.value;
  }

  static fromJSON(json: VacationProps) {
    return VacationEntity.create(json, json.id);
  }

  getActivityAtDate(date: Date) {
    return this.props.activities.filter((activity) => {
      if (!activity.props.datetime) return false;
      return activity.isSameDate(date);
    });
  }

  getUnallocatedActivities() {
    return this.props.activities.filter((a) => a.isUnallocated);
  }

  setPendingActivity(activity: ActivityEntity | null) {
    this._pendingActivity = activity;
  }

  get pendingActivity() {
    return this._pendingActivity;
  }

  get pendingActivityHasFixedDate() {
    return this._pendingActivity?.props.isFixedDate;
  }

  get startDatePendingActivity() {
    const _date = this.pendingActivity?.props.datetime;
    return _date ? _date.value?.toISOString().slice(0, 16) : null;
  }

  getActivityIsUnallocated(activity: ActivityEntity) {
    return activity.isUnallocated;
  }

  getActivityHasFixedDate(activity: ActivityEntity) {
    return activity.props.isFixedDate && activity.props.datetime;
  }
}
