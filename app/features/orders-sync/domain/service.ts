import { ValueObject } from "~/shared";

interface ServiceProps {
  name: string;
  description: string;
}

export class ServiceValueObject extends ValueObject<ServiceProps> {
  private constructor(props: ServiceProps) {
    super(props);
  }

  static create(props: ServiceProps) {
    return new ServiceValueObject(props);
  }

  toString() {
    return `${this.props.name} - ${this.props.description}`;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }
}
