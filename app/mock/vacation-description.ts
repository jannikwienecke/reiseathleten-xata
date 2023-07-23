import { type VacationDescription } from "@prisma/client";

export const TenerifeVacation: VacationDescription = {
  id: 1,
  name: "Tenerife",
  description: "Best Island",
  locationId: 1,
  image_url:
    "https://reiseathleten.de/wp-content/uploads/Reverence-Hotel-Fitnessreise-Mallorca-Fitnessurlaub-fuer-Reiseathleten-15.jpg",
  permalink:
    "https://reiseathleten.de/sportreise-buchung/crossfit-mallorca-urlaub-top-box-premium-hotel-am-traumstrand-kopie/",
  slug: "crossfit-hyrox-mehr-auf-mallorca-top-crossfit-box-wellness-hotel-am-traumstrand-von-santa-ponsa",
  status: "publish",
  type: "booking",
  date_created: "2023-07-16T18:17:02",
  date_created_gmt: "2023-07-16T18:17:02",
  date_modified: "2023-07-16T19:24:37",
  date_modified_gmt: "2023-07-16T19:24:37",
  price: "126",
  date_imported: new Date().toISOString(),
};

export const VACATION_DESCRIPTIONS = [TenerifeVacation];
