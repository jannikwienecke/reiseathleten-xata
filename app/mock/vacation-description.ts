import { VacationDescription } from "@prisma/client";

export const TenerifeVacation: VacationDescription = {
  id: 1,
  name: "Tenerife",
  description: "Best Island",
  image_url: "",
  locationId: 1,
};

export const VACATION_DESCRIPTIONS = [TenerifeVacation];
