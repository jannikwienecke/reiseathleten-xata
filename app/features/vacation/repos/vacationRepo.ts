import type { VacationDtoProps } from "../dto/vacation-dto";

export interface VacationRepo {
  getVacationById(id: string): Promise<VacationDtoProps>;
}
