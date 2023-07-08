import { ValueObject } from "~/shared/domain";

interface ActivityDescriptionProps {
  value: string;
}

export class ActivityDescriptionValueObject extends ValueObject<ActivityDescriptionProps> {
  static minLength = 0;
  static maxLength = 500;
  private constructor(props: ActivityDescriptionProps) {
    super(props);
  }

  static create(props: ActivityDescriptionProps) {
    if (props.value.length < ActivityDescriptionValueObject.minLength) {
      throw new Error(
        `Activity name must be at least ${ActivityDescriptionValueObject.minLength}`
      );
    } else if (props.value.length > ActivityDescriptionValueObject.maxLength) {
      throw new Error(
        `Activity name must be at most ${ActivityDescriptionValueObject.maxLength}`
      );
    }

    return new ActivityDescriptionValueObject(props);
  }
}
