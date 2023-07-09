import { waitFor } from "~/utils/misc";
import type { VacationRepo } from "../vacationRepo";
import type { VacationDtoProps } from "../../dto/vacation-dto";
import { MOCK_SERVER_URL } from "~/shared/constants/base";

export class VacationRepoMockServer implements VacationRepo {
  async getVacationById(id: string) {
    await waitFor(500);

    const result = await fetch(`${MOCK_SERVER_URL}/vacations`);

    const data = (await result.json()) as VacationDtoProps[];

    const vacation = data.find((v) => v.vacation.id === "1");

    if (!vacation) {
      throw new Error("Vacation not found");
    }

    return vacation;
  }
}
