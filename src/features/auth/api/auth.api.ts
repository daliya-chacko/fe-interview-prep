import { http } from '@/shared/lib/http';

import {
  type AdminStats,
  adminStatsSchema,
  type LoginRequest,
  type OrdersResponse,
  ordersResponseSchema,
  type Session,
  sessionSchema,
  type User,
  userSchema,
} from '../model/auth.schema';
import { authHttp } from './auth.client';

/** Exchanges credentials for a session. Unauthenticated: it carries no bearer token. */
export async function login(credentials: LoginRequest): Promise<Session> {
  const payload = await http<unknown>('/auth/login', { method: 'POST', body: credentials });
  return sessionSchema.parse(payload);
}

export async function fetchMe(signal?: AbortSignal): Promise<User> {
  return userSchema.parse(await authHttp<unknown>('/me', { signal }));
}

export async function fetchOrders(signal?: AbortSignal): Promise<OrdersResponse> {
  return ordersResponseSchema.parse(await authHttp<unknown>('/orders', { signal }));
}

export async function fetchAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  return adminStatsSchema.parse(await authHttp<unknown>('/admin/stats', { signal }));
}
