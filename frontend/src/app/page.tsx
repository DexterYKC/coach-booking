import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeAbout } from "@/components/home/HomeAbout";
import { HomeServices } from "@/components/home/HomeServices";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeReviews } from "@/components/home/HomeReviews";
import { HomeLocation } from "@/components/home/HomeLocation";
import { HomeContact } from "@/components/home/HomeContact";
import type { CoachProfile, Service, Review } from "@/types/database";

export const revalidate = 30;
export const dynamic = "force-dynamic";

const DEMO_COACH: CoachProfile = {
  id: "demo",
  user_id: null,
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
  contact_email: "coach@example.com",
  contact_phone: "+216 00 000 000",
  social_links: null,
  updated_at: new Date().toISOString()
};

const DEMO_SERVICES: Service[] = [
  { id: "demo-1", name: "Coaching basketball individuel", description: "Séance personnalisée de coaching basketball technique et tactique.", duration_minutes: 60, price: 60, active: true, sort_order: 1, image_url: null, created_at: "", updated_at: "" },
  { id: "demo-2", name: "Coaching basketball groupe", description: "Séance collective (2 à 6 joueurs) — technique, tactique et match.", duration_minutes: 90, price: 35, active: true, sort_order: 2, image_url: null, created_at: "", updated_at: "" },
  { id: "demo-3", name: "Fitness & préparation physique", description: "Préparation physique adaptée à tous les âges — endurance, gainage, agilité.", duration_minutes: 60, price: 45, active: true, sort_order: 3, image_url: null, created_at: "", updated_at: "" },
  { id: "demo-4", name: "Basketball jeunes (6-15 ans)", description: "Initiation et perfectionnement pour les jeunes joueurs en toute sécurité.", duration_minutes: 60, price: 40, active: true, sort_order: 4, image_url: null, created_at: "", updated_at: "" }
];

export default async function HomePage() {
  let coach: CoachProfile | null = null;
  let services: Service[] = [];
  let reviews: Review[] = [];

  try {
    const supabase = createClient();
    const [coachRes, svcRes, reviewsRes] = await Promise.all([
      supabase.from("coach_profile").select("*").maybeSingle(),
      supabase.from("services").select("*").eq("active", true).order("sort_order", { ascending: true }),
      supabase.from("reviews").select("*, profile:profiles(first_name,last_name,avatar_url)").eq("status", "approved").order("created_at", { ascending: false })
    ]);
    coach = (coachRes.data as CoachProfile) || null;
    services = (svcRes.data as Service[]) || [];
    reviews = (reviewsRes.data as Review[]) || [];
  } catch {
    coach = DEMO_COACH;
    services = DEMO_SERVICES;
  }

  if (!coach) coach = DEMO_COACH;
  if (!services.length) services = DEMO_SERVICES;

  return (
    <main data-testid="home-page">
      <Navbar />
      <HomeHero coach={coach} />
      <HomeAbout coach={coach} />
      <HomeServices services={services} />
      <HomeHowItWorks />
      <HomeReviews reviews={reviews} />
      <HomeLocation coach={coach} />
      <HomeContact coach={coach} />
      <Footer coach={coach} />
    </main>
  );
}
