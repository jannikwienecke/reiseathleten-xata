import { ValueObject } from "~/shared";

type StatusType = "pending" | "validated" | "invoiced" | "paid" | "completed";
interface OrderStatusProps {
  value: StatusType;
}

export class OrderStatusValueObject extends ValueObject<OrderStatusProps> {
  private statusBtnTextDict: {
    [key in StatusType]: string;
  } = {
    pending: "Validate Booking",
    validated: "Send Invoice",
    invoiced: "Mark as Paid",
    paid: "Mark as Completed",
    completed: "",
  };

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

  get isCompleted() {
    return this.props.value === "completed";
  }

  toString() {
    return this.props.value;
  }

  get buttonText() {
    return this.statusBtnTextDict[this.props.value];
  }
}
