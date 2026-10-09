import { z } from 'zod';

export const userGenderSchema = z.enum(['male', 'female']);

/** The subset of a DummyJSON user this feature renders. Extra fields are dropped on parse. */
export const userSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number().int(),
  gender: userGenderSchema,
  email: z.string(),
  address: z.object({
    city: z.string(),
  }),
  company: z.object({
    name: z.string(),
  }),
});

export const usersResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number().int(),
});

export type UserGender = z.infer<typeof userGenderSchema>;
export type User = z.infer<typeof userSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
