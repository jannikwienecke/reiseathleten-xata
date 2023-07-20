import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type OrderEntity } from "../domain/order";

interface OrderStoreState {
  order: OrderEntity;
}

export const useOrderStore = create<OrderStoreState>()(
  devtools(
    // persist(
    (set, get) => ({
      order: {} as OrderEntity,
    }),
    {
      name: "order-store",
    }
  )
);

export const initOrder = (order: OrderEntity) => {
  useOrderStore.setState(
    (state) => {
      return { order };
    },
    false,
    {
      type: "INIT_ORDER",
      order: order,
    }
  );
};
