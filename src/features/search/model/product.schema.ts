import { z } from 'zod';

/** The subset of a DummyJSON product this feature renders. Extra fields are dropped on parse. */
export const productSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
});

export const productSearchResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
