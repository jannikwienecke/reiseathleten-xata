import z from "zod";

export const customerSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  email: z.string(),
  phone: z.string(),
  title: z.string(),
  title_formatted: z.string(),
});

export const shippingSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  phone: z.string(),
  title: z.string(),
  title_formatted: z.string(),
});

export const lineItemSchem = z.object({
  id: z.number(),
  name: z.string(),
  product_id: z.number(),
  total: z.string(),
  meta_data: z.array(
    z.object({
      id: z.number(),
      key: z.string(),
      value: z.union([
        z.string(),
        z.object({}),
        z.array(z.union([z.number(), z.object({})])),
      ]),
    })
  ),
  image: z.object({
    id: z.string(),
    src: z.string(),
  }),
  parent_name: z.string().nullable(),
});

export const orderSchema = z.object({
  id: z.number(),
  date_created: z.string(),
  date_modified: z.string(),
  total: z.string(),
  order_key: z.string(),
  billing: customerSchema,
  shipping: shippingSchema,
  payment_method: z.string(),
  payment_method_title: z.string(),
  // from here we need only the 'geburtsdatum', 'community', 'kenntnis'
  meta_data: z.array(
    z.object({
      id: z.number(),
      key: z.string(),
      value: z.union([z.string(), z.array(z.number())]),
    })
  ),

  // each item in the array is a new order
  // so if the order has 3 items, we will create three orders with one item each
  line_items: z.array(lineItemSchem),
});

export const orderResultSchema = z.object({
  data: z.array(orderSchema),
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  permalink: z.string(),
  date_created: z.string(),
  date_created_gmt: z.string(),
  date_modified: z.string(),
  date_modified_gmt: z.string(),
  type: z.string(),
  status: z.string(),
  description: z.string(),
  price: z.string(),
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
    })
  ),
  images: z.array(
    z.object({
      id: z.number(),
      date_created: z.string(),
      date_created_gmt: z.string(),
      date_modified: z.string(),
      date_modified_gmt: z.string(),
      src: z.string(),
      name: z.string(),
      alt: z.string(),
    })
  ),
});

export const productResponseSchema = z.object({
  data: z.array(productSchema),
});
