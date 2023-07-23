import type { RawProduct } from "../api/types";

export interface ProductsRepository {
  getLatest(options: {
    offset?: number;
    limit?: number;
    after?: string;
  }): Promise<RawProduct[]>;
}
