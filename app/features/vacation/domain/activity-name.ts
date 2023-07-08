import { ValueObject } from "~/shared/domain";

interface ActivityNameProps {
  value: string;
}

export class ActivityNameValueObject extends ValueObject<ActivityNameProps> {
  static minLength = 3;
  static maxLength = 40;
  private constructor(props: ActivityNameProps) {
    super(props);
  }

  static create(props: ActivityNameProps) {
    if (props.value.length < ActivityNameValueObject.minLength) {
      throw new Error(
        `Activity name must be at least ${ActivityNameValueObject.minLength}`
      );
    } else if (props.value.length > ActivityNameValueObject.maxLength) {
      throw new Error(
        `Activity name must be at most ${ActivityNameValueObject.maxLength}`
      );
    }

    return new ActivityNameValueObject(props);
  }
}
