import type { ServiceValueObject } from "../domain/service";
import type { ServiceList } from "../domain/service-list";

export interface ServicesRepo {
  getServicesForVacation: (vacationId: number) => Promise<ServiceList>;
  getById: (id: number) => Promise<ServiceValueObject | null>;
}
