import type z from "zod";
import type {
  lineItemSchem,
  shippingSchema,
  customerSchema,
  orderSchema,
  orderResultSchema,
  productSchema,
} from "./schema";

export type RawOrderResult = z.infer<typeof orderResultSchema>;
export type RawOrder = z.infer<typeof orderSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type RawShipping = z.infer<typeof shippingSchema>;
export type RawLineItem = z.infer<typeof lineItemSchem>;

export type RawProduct = z.infer<typeof productSchema>;
