import type { VacationDtoProps } from "../dto/vacation-dto";

export interface ActivityRepo {
  confirmDate(activityId: number, date: string): Promise<void>;
}
