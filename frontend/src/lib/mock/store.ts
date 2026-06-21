import { randomUUID } from "crypto";

export function nowIso() {
  return new Date().toISOString();
}

export function genId() {
  return randomUUID();
}

function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export interface MockAuthUser {
  id: string;
  email: string;
  password: string;
  user_metadata: Record<string, any>;
}

interface MockStore {
  authUsers: MockAuthUser[];
  sessions: Map<string, string>; // token -> userId
  tables: Record<string, any[]>;
}

export const ADMIN_EMAIL = "admin@example.com";
export const ADMIN_PASSWORD = "Admin123!";
export const COACH_EMAIL = "coach@example.com";
export const COACH_PASSWORD = "Coach123!";
export const DEMO_EMAIL = "client@example.com";
export const DEMO_PASSWORD = "Client123!";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const COACH_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000003";

function buildSeed(): MockStore {
  const t = nowIso();
  const today = new Date();

  return {
    authUsers: [
      { id: ADMIN_ID, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, user_metadata: { first_name: "Super", last_name: "Admin", role: "admin" } },
      { id: COACH_ID, email: COACH_EMAIL, password: COACH_PASSWORD, user_metadata: { first_name: "Coach", last_name: "Basket", role: "coach" } },
      { id: DEMO_USER_ID, email: DEMO_EMAIL, password: DEMO_PASSWORD, user_metadata: { first_name: "Demo", last_name: "Client", role: "user" } }
    ],
    sessions: new Map(),
    tables: {
      profiles: [
        { id: ADMIN_ID, role: "admin", first_name: "Super", last_name: "Admin", email: ADMIN_EMAIL, phone: null, city: null, basketball_level: null, age_group: null, avatar_url: null, banned: false, created_at: t, updated_at: t },
        { id: COACH_ID, role: "coach", first_name: "Coach", last_name: "Basket", email: COACH_EMAIL, phone: "+216 20 000 000", city: "Tunis", basketball_level: null, age_group: null, avatar_url: null, banned: false, created_at: t, updated_at: t },
        { id: DEMO_USER_ID, role: "user", first_name: "Demo", last_name: "Client", email: DEMO_EMAIL, phone: "+216 22 111 222", city: "Tunis", basketball_level: "intermediaire", age_group: "adulte", avatar_url: null, banned: false, created_at: t, updated_at: t }
      ],
      coach_profile: [
        {
          id: "coach-1",
          user_id: COACH_ID,
          full_name: "Coach Basketball",
          tagline: "Coach de basketball certifié — Tunisie",
          bio: "Coach passionné depuis plus de 10 ans, je propose un coaching individuel et collectif adapté à tous les niveaux. Ma méthode allie technique, condition physique et plaisir du jeu.",
          photo_url: null,
          gallery: [],
          location: "Tunis, Tunisie",
          specialties: ["Tir à 3 points", "Dribble & handle", "Préparation physique", "Tactique de jeu"],
          certifications: ["BEES Basketball", "FIBA Coach Level 1"],
          experience_years: 10,
          philosophy: "Le basketball, c'est avant tout du collectif et du dépassement de soi.",
          contact_email: COACH_EMAIL,
          contact_phone: "+216 20 000 000",
          social_links: { facebook: "https://facebook.com/example-coach", instagram: "https://instagram.com/example-coach", tiktok: null },
          updated_at: t
        }
      ],
      services: [
        { id: "demo-1", name: "Coaching basketball individuel", description: "Séance personnalisée de coaching basketball technique et tactique.", duration_minutes: 60, price: 60, active: true, sort_order: 1, image_url: null, created_at: t, updated_at: t },
        { id: "demo-2", name: "Coaching basketball groupe", description: "Séance collective (2 à 6 joueurs) — technique, tactique et match.", duration_minutes: 90, price: 35, active: true, sort_order: 2, image_url: null, created_at: t, updated_at: t },
        { id: "demo-3", name: "Fitness & préparation physique", description: "Préparation physique adaptée à tous les âges — endurance, gainage, agilité.", duration_minutes: 60, price: 45, active: true, sort_order: 3, image_url: null, created_at: t, updated_at: t },
        { id: "demo-4", name: "Basketball jeunes (6-15 ans)", description: "Initiation et perfectionnement pour les jeunes joueurs en toute sécurité.", duration_minutes: 60, price: 40, active: true, sort_order: 4, image_url: null, created_at: t, updated_at: t }
      ],
      availability_slots: [1, 2, 3, 4, 5, 6].flatMap((day) => [
        { id: genId(), day_of_week: day, start_time: "09:00:00", end_time: "10:00:00", active: true, created_at: t },
        { id: genId(), day_of_week: day, start_time: "18:00:00", end_time: "19:00:00", active: true, created_at: t }
      ]),
      bookings: [
        { id: genId(), user_id: DEMO_USER_ID, service_id: "demo-1", slot_date: ymd(addDays(today, 1)), slot_time: "09:00:00", status: "confirme", notes: null, price_snapshot: 60, created_at: t, updated_at: t },
        { id: genId(), user_id: DEMO_USER_ID, service_id: "demo-2", slot_date: ymd(addDays(today, 3)), slot_time: "18:00:00", status: "en_attente", notes: "Première séance", price_snapshot: 35, created_at: t, updated_at: t }
      ],
      notification_emails: [{ id: genId(), email: ADMIN_EMAIL, label: "Admin", active: true, created_at: t }],
      notification_whatsapp: [],
      notification_templates: [
        { id: genId(), type: "booking_created_user", subject: "Réservation reçue", body_email: "Bonjour {{first_name}}, votre réservation pour {{service_name}} le {{slot_date}} à {{slot_time}} a été enregistrée.", body_whatsapp: "Bonjour {{first_name}}, réservation {{service_name}} le {{slot_date}} {{slot_time}} enregistrée.", updated_at: t },
        { id: genId(), type: "booking_status_user", subject: "Mise à jour de votre réservation", body_email: "Bonjour {{first_name}}, votre réservation du {{slot_date}} est maintenant : {{status}}.", body_whatsapp: "Réservation du {{slot_date}} : {{status}}.", updated_at: t },
        { id: genId(), type: "booking_created_admin", subject: "Nouvelle réservation", body_email: "Nouvelle réservation de {{first_name}} {{last_name}} pour {{service_name}} le {{slot_date}} à {{slot_time}}.", body_whatsapp: "Nouvelle réservation : {{first_name}} {{last_name}} - {{service_name}} - {{slot_date}} {{slot_time}}.", updated_at: t },
        { id: genId(), type: "booking_status_admin", subject: "Statut de réservation modifié", body_email: "La réservation de {{first_name}} {{last_name}} du {{slot_date}} est maintenant : {{status}}.", body_whatsapp: "Réservation {{first_name}} {{last_name}} {{slot_date}} : {{status}}.", updated_at: t }
      ],
      activity_log: [],
      contact_messages: [],
      reviews: [
        { id: genId(), user_id: DEMO_USER_ID, rating: 5, comment: "Excellent coaching, j'ai beaucoup progressé sur mon tir en quelques séances !", status: "approved", created_at: t, updated_at: t },
        { id: genId(), user_id: DEMO_USER_ID, rating: 4, comment: "Très pédagogue et patient, je recommande pour les débutants.", status: "approved", created_at: t, updated_at: t }
      ]
    }
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __mockStore: MockStore | undefined;
}

export function getStore(): MockStore {
  if (!globalThis.__mockStore) {
    globalThis.__mockStore = buildSeed();
  }
  return globalThis.__mockStore;
}

export function getTable(name: string): any[] {
  const store = getStore();
  if (!store.tables[name]) store.tables[name] = [];
  return store.tables[name];
}

// Mirrors the column DEFAULTs from supabase/migrations/00000_initial_schema.sql,
// since the in-memory store has no DB-level defaults of its own.
const TABLE_DEFAULTS: Record<string, () => Record<string, any>> = {
  bookings: () => ({ status: "en_attente" }),
  services: () => ({ active: true, sort_order: 0 }),
  availability_slots: () => ({ active: true }),
  notification_emails: () => ({ active: true }),
  notification_whatsapp: () => ({ active: true }),
  profiles: () => ({ role: "user", banned: false }),
  contact_messages: () => ({ read: false }),
  reviews: () => ({ status: "pending" })
};

export function insertRow(tableName: string, payload: any) {
  const table = getTable(tableName);
  const t = nowIso();
  const defaults = TABLE_DEFAULTS[tableName]?.() || {};
  const row = { id: genId(), created_at: t, updated_at: t, ...defaults, ...payload };
  table.push(row);
  return row;
}

export function removeRows(tableName: string, ids: Set<string>) {
  const table = getTable(tableName);
  for (let i = table.length - 1; i >= 0; i--) {
    if (ids.has(table[i].id)) table.splice(i, 1);
  }
}
