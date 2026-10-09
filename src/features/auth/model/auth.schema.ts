import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'user']);

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;

/** Body of `POST /auth/login`. The login form reuses it so the form and the API agree. */
export const loginRequestSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** Body of `POST /auth/refresh`. */
export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

/** Returned by both `POST /auth/login` and `POST /auth/refresh`: a token pair plus its owner. */
export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: userSchema,
});

export type Session = z.infer<typeof sessionSchema>;

export const orderSchema = z.object({
  id: z.string().min(1),
  item: z.string().min(1),
  /** Whole currency units; the mock backend never deals in fractions. */
  total: z.number().nonnegative(),
  /** ISO 8601 date, kept as a string so it survives JSON without a reviver. */
  placedAt: z.iso.date(),
});

export const ordersResponseSchema = z.object({
  orders: z.array(orderSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;

export const adminStatsSchema = z.object({
  users: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

/** The slice of the session store that is written to storage and read back on load. */
export const persistedSessionSchema = z.object({
  refreshToken: z.string().min(1).nullable(),
});

export type PersistedSession = z.infer<typeof persistedSessionSchema>;
