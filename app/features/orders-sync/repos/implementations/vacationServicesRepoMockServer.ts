import type { Service } from "@prisma/client";
import { MOCK_SERVER_URL } from "~/shared/constants/base";
import { ServiceValueObject } from "../../domain/service";
import { ServiceList } from "../../domain/service-list";
import { type VacationServicesRepo } from "../vacationServicesRepo";

export class VacationServicesRepoMockServer implements VacationServicesRepo {
  async getServicesForVacation(vacationId: number) {
    const result = await fetch(`${MOCK_SERVER_URL}/vacation/:id/services`);

    const services = (await result.json()) as Service[];

    return ServiceList.create(
      services.map((s) =>
        ServiceValueObject.create({
          name: s.name,
          description: s.description,
        })
      )
    );
  }
}
