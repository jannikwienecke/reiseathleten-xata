import type { VacationDtoProps, VacationsDtoProps } from "../dto/vacation-dto";

export interface VacationRepo {
  getVacationById(id: number, userId: number): Promise<VacationDtoProps | null>;
  getVacationsByUserId(userId: number): Promise<VacationsDtoProps>;
}
