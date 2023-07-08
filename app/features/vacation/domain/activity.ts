import { Entity } from "~/shared/domain/entity";
import type { TagValueObject } from "./tag";
import type { DateValueObject } from "./date";
import type { ActivityNameValueObject } from "./activity-name";
import type { ActivityDescriptionValueObject } from "./activity-description";

interface ActivityProps {
  tags: TagValueObject[];
  isFixedDate: boolean;
  datetime?: DateValueObject;
  name: ActivityNameValueObject;
  description: ActivityDescriptionValueObject;
  id: string;
}

export class ActivityEntity extends Entity<ActivityProps> {
  private constructor(props: ActivityProps) {
    super(props);
  }

  public static create(props: ActivityProps) {
    return new ActivityEntity(props);
  }

  public isSameDate(date: Date) {
    return (
      this.props.datetime?.value?.getFullYear() === date?.getFullYear() &&
      this.props.datetime?.value?.getMonth() === date?.getMonth() &&
      this.props.datetime?.value?.getDate() === date?.getDate()
    );
  }

  public get isUnallocated() {
    return !this.props.datetime?.value;
  }

  public get isFixedDate() {
    return this.props.isFixedDate;
  }

  public get datetime() {
    return this.props.datetime?.value;
  }

  public get name() {
    return this.props.name.props.value;
  }

  public get tags() {
    return this.props.tags;
  }
}
