import { type DateValueObject } from "~/features/vacation/domain/date";
import { ValueObject } from "~/shared";
import { type Mood } from "./mood";

export interface ActivityEventProps {
  content?: string;
  mood?: Mood;
  user: {
    name: string;
    imageUri: string;
  };
  date: DateValueObject;
  type:
    | "created"
    | "imported"
    | "modified"
    | "deleted"
    | "paid"
    | "unpaid"
    | "sent"
    | "unsent"
    | "confirmed"
    | "unconfirmed"
    | "cancelled"
    | "uncancelled"
    | "commented";
}

export class ActivityEvent extends ValueObject<ActivityEventProps> {
  private constructor(props: ActivityEventProps) {
    super(props);
  }

  static create(props: ActivityEventProps) {
    return new ActivityEvent(props);
  }

  get content() {
    return this.props.content;
  }

  get username() {
    return this.props.user.name;
  }

  get userImageUri() {
    return this.props.user.imageUri;
  }

  get dateString() {
    return this.props.date.value?.toLocaleDateString();
  }

  get daysAgo() {
    const days = this.props.date.daysAgo;
    const daysString = days === 1 ? "day" : "days";

    switch (days) {
      case 0:
        return `Today at ${this.props.date.value
          ?.toLocaleTimeString()
          .slice(0, -3)}`;
      case 1:
        return "Yesterday";
      default:
        return `${days} ${daysString} ago`;
    }
  }

  get type() {
    return this.props.type;
  }

  get mood() {
    return this.props.mood;
  }
}
