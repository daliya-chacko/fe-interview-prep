import { http, HttpResponse, type RequestHandler } from 'msw';

import { env } from '@/shared/lib/env';

import type { Product } from './model/product.schema';

/** Small, deterministic catalogue so the demo and the tests do not depend on the live API. */
export const searchFixture: Product[] = [
  {
    id: 1,
    title: 'React Handbook',
    description: 'A practical guide to building interfaces with React.',
    category: 'books',
    price: 29,
  },
  {
    id: 2,
    title: 'Reactive Headphones',
    description: 'Noise-cancelling headphones that react to the room.',
    category: 'audio',
    price: 199,
  },
  {
    id: 3,
    title: 'Red Notebook',
    description: 'A5 dotted notebook with a red cover.',
    category: 'stationery',
    price: 9,
  },
  {
    id: 4,
    title: 'Blue Mug',
    description: 'Ceramic mug, holds 350 ml.',
    category: 'kitchen',
    price: 12,
  },
];

function matches(product: Product, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    product.title.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle)
  );
}

/** Mirrors DummyJSON's `/products/search?q=` contract against the fixture above. */
export const searchHandlers: RequestHandler[] = [
  http.get(env.VITE_SEARCH_API_URL, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    const products = q ? searchFixture.filter((product) => matches(product, q)) : searchFixture;
    return HttpResponse.json({ products, total: products.length, skip: 0, limit: products.length });
  }),
];
