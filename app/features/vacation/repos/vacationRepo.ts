import type { VacationDtoProps } from "../dto/vacation-dto";

export interface VacationRepo {
  getVacationById(id: number): Promise<VacationDtoProps>;
}
