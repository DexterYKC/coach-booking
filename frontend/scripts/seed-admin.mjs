#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seed admin, coach & demo client users in Supabase.
 *  node scripts/seed-admin.mjs dotenv_config_path=.env.local
 *
 * Reads ADMIN_EMAIL/ADMIN_PASSWORD, COACH_EMAIL/COACH_PASSWORD,
 * CLIENT_EMAIL/CLIENT_PASSWORD from .env.local
 * Uses SUPABASE_SERVICE_ROLE_KEY to create users via Admin API.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function upsertUser({ email, password, role, firstName, lastName }) {
  if (!email || !password) {
    console.warn(`Skipping ${role}: missing email or password`);
    return;
  }
  console.log(`→ Ensuring ${role} user ${email} ...`);
  // Try create
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role }
  });
  let userId = created?.user?.id;
  if (createErr && !/already/i.test(createErr.message)) {
    console.error(createErr.message);
    return;
  }
  if (!userId) {
    // Find existing
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    userId = found?.id;
  }
  if (!userId) {
    console.error("Could not resolve user id for", email);
    return;
  }
  // Upsert profile
  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role
    },
    { onConflict: "id" }
  );
  if (profErr) console.error("Profile upsert error:", profErr.message);

  if (role === "coach") {
    await admin
      .from("coach_profile")
      .update({ user_id: userId, contact_email: email })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }
  console.log(`✓ ${role} ready: ${email}`);
}

await upsertUser({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: "admin",
  firstName: "Super",
  lastName: "Admin"
});

await upsertUser({
  email: process.env.COACH_EMAIL,
  password: process.env.COACH_PASSWORD,
  role: "coach",
  firstName: "Coach",
  lastName: "Basket"
});

await upsertUser({
  email: process.env.CLIENT_EMAIL,
  password: process.env.CLIENT_PASSWORD,
  role: "user",
  firstName: "Demo",
  lastName: "Client"
});

console.log("Done.");
