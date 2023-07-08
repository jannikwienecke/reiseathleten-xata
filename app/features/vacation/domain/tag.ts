import { ValueObject } from "~/shared/domain";

interface TagProps {
  label: string;
  color: string;
}

export class TagValueObject extends ValueObject<TagProps> {
  private constructor(props: TagProps) {
    super(props);
  }

  public static create(props: TagProps) {
    return new TagValueObject(props);
  }

  public get label() {
    return this.props.label;
  }

  public get color() {
    return this.props.color;
  }
}
