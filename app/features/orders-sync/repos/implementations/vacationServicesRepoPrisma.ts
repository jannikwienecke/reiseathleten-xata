import type { PrismaClient } from "@prisma/client";
import { ServiceList } from "../../domain/service-list";
import { type ServicesRepo } from "../vacationServicesRepo";
import { ServiceValueObject } from "../../domain/service";

export class VacationServicesRepoPrisma implements ServicesRepo {
  constructor(private client: PrismaClient) {}
  async getById(id: number) {
    const service = await this.client.service.findUnique({
      where: {
        id: id,
      },
    });

    if (!service) {
      return null;
    }

    return ServiceValueObject.create({
      name: service.name,
      description: service.description,
    });
  }

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
