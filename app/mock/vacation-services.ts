import { type VacationServices, type Service } from "@prisma/client";

export const Halbpension: Service = {
  id: 1,
  name: "Halbpension",
  description: "food",
};

export const ShuttleService: Service = {
  id: 2,
  name: "Shuttle",
  description: "Shutle Service",
};

export const services = [Halbpension, ShuttleService];

export const vacationServices1: VacationServices = {
  id: 1,
  service_id: 1,
  vacation_id: 1,
};

export const vacationServices2: VacationServices = {
  id: 2,
  service_id: 2,
  vacation_id: 1,
};

export const vacationServices = [vacationServices1, vacationServices2];
