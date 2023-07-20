import { ServiceList } from "../domain/service-list";

export interface VacationServicesRepo {
  getServicesForVacation: (vacationId: number) => Promise<ServiceList>;
}
