import { api } from './api';
import type { Session, User } from './types';

export async function login(input: { email: string; password: string }): Promise<Session> {
  const { data } = await api.post<Session>('/auth/login', input);
  return data;
}

export async function register(input: { name: string; email: string; password: string }): Promise<Session> {
  const { data } = await api.post<Session>('/auth/register', input);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
