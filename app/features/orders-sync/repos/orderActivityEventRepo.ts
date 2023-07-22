import { ActivityEventList } from "../domain/activity-event-list";

export interface OrderActivityEventRepo {
  save(props: {
    activityEventList: ActivityEventList;
    orderId: number;
    userId: number;
  }): Promise<void>;
}
