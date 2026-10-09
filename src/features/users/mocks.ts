import { http, HttpResponse, type RequestHandler } from 'msw';

import { env } from '@/shared/lib/env';

import type { User } from './model/user.schema';

/** How many users the fixture holds; well above the five hundred the table must handle. */
export const USERS_FIXTURE_SIZE = 600;

const femaleNames = [
  'Emily',
  'Olivia',
  'Sophia',
  'Isabella',
  'Charlotte',
  'Amelia',
  'Harper',
  'Evelyn',
  'Abigail',
  'Ella',
  'Scarlett',
  'Grace',
  'Chloe',
  'Victoria',
  'Riley',
  'Aria',
  'Lily',
  'Zoe',
  'Nora',
  'Hazel',
] as const;

const maleNames = [
  'Liam',
  'Noah',
  'Oliver',
  'Elijah',
  'James',
  'William',
  'Benjamin',
  'Lucas',
  'Henry',
  'Theodore',
  'Jack',
  'Levi',
  'Alexander',
  'Owen',
  'Samuel',
  'Mateo',
  'Daniel',
  'Ezra',
  'Leo',
  'Miles',
] as const;

const lastNames = [
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
] as const;

const cities = [
  'Phoenix',
  'Houston',
  'Denver',
  'Seattle',
  'Portland',
  'Austin',
  'Boston',
  'Chicago',
  'Nashville',
  'Las Vegas',
  'San Diego',
  'Dallas',
  'Atlanta',
  'Miami',
  'Detroit',
  'Columbus',
  'Charlotte',
  'Indianapolis',
  'Louisville',
  'Baltimore',
  'Milwaukee',
  'Memphis',
  'Tucson',
  'Fresno',
  'Omaha',
] as const;

const companies = [
  'Dooley, Kozey and Cronin',
  'Spinka - Dickinson',
  'Hauck Inc',
  'Hermiston Group',
  'Lebsack and Sons',
  'Bauch LLC',
  'Hagenes - Boyer',
  'Tromp Group',
  'Kuhn Inc',
  'Schiller - Wunsch',
  'Wisozk - Toy',
  'Feest Group',
  'Jaskolski LLC',
  'Hudson, Lind and Kreiger',
  'Pagac - Rowe',
  'Trantow Inc',
  'Barrows - Mills',
  'Kassulke LLC',
  'Collier Group',
  'Yost - Koch',
] as const;

function pick<T>(list: readonly T[], index: number): T {
  const item = list[index % list.length];
  if (item === undefined) throw new Error('Cannot pick from an empty list');
  return item;
}

/**
 * One user from its 1-based id, with no randomness: every stride below is coprime with the list
 * lengths, so the combinations spread out and the same id always yields the same user.
 */
function makeUser(id: number): User {
  const gender = id % 2 === 0 ? 'female' : 'male';
  const firstName = pick(gender === 'female' ? femaleNames : maleNames, id * 7);
  const lastName = pick(lastNames, id * 11);

  return {
    id,
    firstName,
    lastName,
    age: 18 + ((id * 13) % 48),
    gender,
    email: `${firstName}.${lastName}${id}@example.com`.toLowerCase(),
    address: { city: pick(cities, id * 3) },
    company: { name: pick(companies, id * 17) },
  };
}

/** Deterministic dataset so the demo and the tests do not depend on the live API. */
export const usersFixture: User[] = Array.from({ length: USERS_FIXTURE_SIZE }, (_, index) =>
  makeUser(index + 1),
);

/** Mirrors DummyJSON's `/users?limit=&skip=` contract against the fixture above. */
export const usersHandlers: RequestHandler[] = [
  http.get(env.VITE_USERS_API_URL, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const skip = Number(params.get('skip') ?? 0);
    const limit = Number(params.get('limit') ?? 30);
    const users = limit === 0 ? usersFixture.slice(skip) : usersFixture.slice(skip, skip + limit);
    return HttpResponse.json({ users, total: usersFixture.length, skip, limit: users.length });
  }),
];
