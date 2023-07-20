import type { PrismaClient } from "@prisma/client";
import { ServiceList } from "../../domain/service-list";
import { type VacationServicesRepo } from "../vacationServicesRepo";
import { ServiceValueObject } from "../../domain/service";

export class VacationServicesRepoPrisma implements VacationServicesRepo {
  constructor(private client: PrismaClient) {}

  async getServicesForVacation(vacationId: number) {
    const services = await this.client.vacationServices.findMany({
      where: {
        vacation_id: vacationId,
      },
      include: {
        Service: true,
      },
    });

    return ServiceList.create(
      services.map((s) =>
        ServiceValueObject.create({
          name: s.Service.name,
          description: s.Service.description,
        })
      )
    );
  }
}
