import type { Service } from "@prisma/client";
import { MOCK_SERVER_URL } from "~/shared/constants/base";
import { ServiceValueObject } from "../../domain/service";
import { ServiceList } from "../../domain/service-list";
import { type VacationServicesRepo } from "../vacationServicesRepo";

export class VacationServicesRepoMockServer implements VacationServicesRepo {
  async getServicesForVacation(vacationId: number) {
    const response = await fetch(`${MOCK_SERVER_URL}/vacation/:id/services`);

    const result = (await response.json()) as {
      data: {
        services: Service[] | null;
      };
    };

    return ServiceList.create(
      result.data?.services?.map((s) =>
        ServiceValueObject.create({
          name: s.name,
          description: s.description,
        })
      ) ?? []
    );
  }
}
