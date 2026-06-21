import { getStore, genId, nowIso } from "./store";

export function createSession(userId: string): string {
  const token = genId();
  getStore().sessions.set(token, userId);
  return token;
}

export function destroySession(token: string | undefined | null) {
  if (!token) return;
  getStore().sessions.delete(token);
}

export function getUserIdBySession(token: string | undefined | null): string | null {
  if (!token) return null;
  return getStore().sessions.get(token) ?? null;
}

export function findAuthUserById(id: string) {
  return getStore().authUsers.find((u) => u.id === id) ?? null;
}

export function findAuthUserByEmail(email: string) {
  return getStore().authUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function toSupabaseUser(authUser: { id: string; email: string; user_metadata: any }) {
  return {
    id: authUser.id,
    email: authUser.email,
    user_metadata: authUser.user_metadata,
    app_metadata: {},
    aud: "authenticated",
    created_at: nowIso()
  };
}

export function signUpUser({ email, password, data }: { email: string; password: string; data?: any }) {
  const store = getStore();
  if (findAuthUserByEmail(email)) {
    return { user: null, error: { message: "Un compte existe déjà avec cet email" } };
  }
  const id = genId();
  const authUser = { id, email, password, user_metadata: data || {} };
  store.authUsers.push(authUser);

  const t = nowIso();
  store.tables.profiles.push({
    id,
    role: "user",
    first_name: data?.first_name ?? null,
    last_name: data?.last_name ?? null,
    email,
    phone: null,
    city: null,
    basketball_level: null,
    age_group: null,
    avatar_url: null,
    banned: false,
    created_at: t,
    updated_at: t
  });

  return { user: toSupabaseUser(authUser), error: null };
}

export function signInUser({ email, password }: { email: string; password: string }) {
  const authUser = findAuthUserByEmail(email);
  if (!authUser || authUser.password !== password) {
    return { user: null, error: { message: "Identifiants invalides" } };
  }
  return { user: toSupabaseUser(authUser), error: null };
}

export function deleteAuthUser(id: string) {
  const store = getStore();
  store.authUsers = store.authUsers.filter((u) => u.id !== id);
  store.tables.profiles = store.tables.profiles.filter((p) => p.id !== id);
  for (const [token, uid] of store.sessions.entries()) {
    if (uid === id) store.sessions.delete(token);
  }
}
