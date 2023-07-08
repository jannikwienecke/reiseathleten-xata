import type { VacationDtoProps } from "../dto/vacation-dto";

export interface ActivityRepo {
  confirmDate(activityId: string, date: string): Promise<void>;
}
