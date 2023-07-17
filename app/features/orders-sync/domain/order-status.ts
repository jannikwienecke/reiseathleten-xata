import { ValueObject } from "~/shared";

interface OrderStatusProps {
  value: "pending" | "validated" | "open" | "completed";
}

export class OrderStatusValueObject extends ValueObject<OrderStatusProps> {
  private constructor(props: OrderStatusProps) {
    super(props);
  }

  static create(props: OrderStatusProps) {
    return new OrderStatusValueObject(props);
  }

  get value() {
    return this.props.value;
  }

  get isPending() {
    return this.props.value === "pending";
  }

  get isValidated() {
    return this.props.value === "validated";
  }

  get isOpen() {
    return this.props.value === "open";
  }

  get isCompleted() {
    return this.props.value === "completed";
  }

  toString() {
    return this.props.value;
  }
}
