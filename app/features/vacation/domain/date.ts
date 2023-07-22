import { ValueObject } from "~/shared/domain";

interface DateValueObjectProps {
  value?: string;
}

export class DateValueObject extends ValueObject<DateValueObjectProps> {
  private constructor(props: DateValueObjectProps) {
    super(props);
  }

  get value() {
    if (!this.props.value) return undefined;
    return new Date(this.props.value);
  }

  static create(props: DateValueObjectProps) {
    return new DateValueObject(props);
  }

  get daysAgo() {
    const now = new Date();
    const date = this.value;

    const diffTime = Math.abs(
      now.getTime() - (date?.getTime?.() ?? now.getTime())
    );

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
