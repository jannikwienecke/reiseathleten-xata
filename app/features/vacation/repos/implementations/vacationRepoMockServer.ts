import { waitFor } from "~/utils/misc";
import type { VacationRepo } from "../vacationRepo";
import type {
  VacationDtoProps,
  VacationsDtoProps,
} from "../../dto/vacation-dto";
import { MOCK_SERVER_URL } from "~/shared/constants/base";

export class VacationRepoMockServer implements VacationRepo {
  async getVacationById(id: number) {
    await waitFor(500);

    const result = await fetch(`${MOCK_SERVER_URL}/vacations/${id}`);

    const vacation = (await result.json()) as VacationDtoProps;

    return vacation;
  }

  async getVacationsByUserId(userId: number): Promise<VacationsDtoProps> {
    await waitFor(500);

    const result = await fetch(`${MOCK_SERVER_URL}/vacations`);
    const vacations = (await result.json()) as VacationsDtoProps;

    return vacations;
  }
}
