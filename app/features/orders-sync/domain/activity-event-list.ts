import { ValueObject } from "~/shared";
import { ActivityEvent, type ActivityEventProps } from "./activity-event";

export class ActivityEventList extends ValueObject<ActivityEvent[]> {
  events: ActivityEvent[];
  newEvents: ActivityEvent[];

  private constructor(props: ActivityEvent[]) {
    super(props);
    this.events = props;
    this.newEvents = [];
  }

  static create(props: ActivityEvent[]) {
    return new ActivityEventList(props);
  }

  static createCreatedEvent({
    user,
    date,
  }: {
    user: ActivityEventProps["user"];
    date: ActivityEventProps["date"];
  }) {
    const createdEvent = ActivityEvent.create({
      type: "created",
      user,
      date,
    });

    const events = this.create([createdEvent]);
    events.addEvent(createdEvent);
    return events;
  }

  addEvent(event: ActivityEvent) {
    this.events.push(event);
    this.newEvents.push(event);
  }

  get list() {
    return this.events.map((event) => event);
  }
}
