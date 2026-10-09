import { env } from '@/shared/lib/env';
import { http } from '@/shared/lib/http';

import { type ProductSearchResponse, productSearchResponseSchema } from '../model/product.schema';

export type SearchProductsOptions = {
  /** Aborts the in-flight request when the caller no longer needs its result. */
  signal?: AbortSignal;
};

/** Searches products by free text and validates the payload at the boundary. */
export async function searchProducts(
  q: string,
  { signal }: SearchProductsOptions = {},
): Promise<ProductSearchResponse> {
  const payload = await http<unknown>(env.VITE_SEARCH_API_URL, { searchParams: { q }, signal });
  return productSearchResponseSchema.parse(payload);
}
