import type { VacationDtoProps, VacationsDtoProps } from "../dto/vacation-dto";

export interface VacationRepo {
  getVacationById(
    id: number,
    userId: number,
    isAdmin?: boolean
  ): Promise<VacationDtoProps | null>;
  getVacationsByUserId(userId: number): Promise<VacationsDtoProps>;
  getAllVacations(): Promise<VacationsDtoProps>;
}
