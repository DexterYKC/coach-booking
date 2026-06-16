"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Tag, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { priceFR } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";
import type { Service } from "@/types/database";

function extractPath(publicUrl: string, bucket: string): string | null {
  const idx = publicUrl.indexOf(`/${bucket}/`);
  if (idx < 0) return null;
  return publicUrl.substring(idx + bucket.length + 2);
}

export default function CoachServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/services");
    const j = await r.json();
    setServices(j.services || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function update(id: string, patch: Partial<Service>) {
    setServices((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function setImage(s: Service, url: string) {
    update(s.id, { image_url: url });
    await fetch(`/api/services/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: url }) });
  }
  async function removeImage(s: Service) {
    const path = extractPath(s.image_url || "", "service-images");
    update(s.id, { image_url: null });
    await fetch(`/api/services/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: null }) });
    if (path) await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: "service-images", path }) });
  }

  async function save(s: Service) {
    setSavingId(s.id);
    const r = await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: s.name,
        description: s.description,
        duration_minutes: s.duration_minutes,
        price: Number(s.price) || 0,
        active: s.active
      })
    });
    setSavingId(null);
    if (!r.ok) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Service mis à jour");
  }

  return (
    <div data-testid="coach-services-page">
      <h1 className="heading text-3xl font-bold">Services & tarifs</h1>
      <p className="text-ink-muted mt-1">
        Mettez à jour les tarifs (en TND) et descriptions de vos services. Les modifications s&apos;affichent immédiatement sur la page d&apos;accueil.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {loading && <Loader2 className="animate-spin text-brand mx-auto" />}
        {!loading && services.length === 0 && (
          <div className="card text-center col-span-full" data-testid="services-empty">
            <p className="text-ink-muted">Aucun service. Demandez à l&apos;admin d&apos;en créer.</p>
          </div>
        )}
        {services.map((s) => (
          <div key={s.id} className="card" data-testid={`coach-svc-card-${s.id}`}>
            <ImageUploader
              bucket="service-images"
              folder={s.id}
              currentUrl={s.image_url}
              onUploaded={(url) => setImage(s, url)}
              onRemoved={() => removeImage(s)}
              testId={`coach-svc-image-${s.id}`}
              label="Ajouter une image pour ce service"
            />
            <div className="flex items-center gap-2 text-brand mb-3 mt-4">
              <Tag size={16} />
              <span className="text-xs uppercase tracking-wide font-semibold">{priceFR(s.price)}</span>
            </div>
            <label className="label">Nom</label>
            <input
              className="input font-medium"
              value={s.name}
              onChange={(e) => update(s.id, { name: e.target.value })}
              data-testid={`coach-svc-name-${s.id}`}
            />
            <label className="label mt-3">Description</label>
            <textarea
              rows={2}
              className="input"
              value={s.description || ""}
              onChange={(e) => update(s.id, { description: e.target.value })}
              data-testid={`coach-svc-desc-${s.id}`}
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="label flex items-center gap-1"><Clock size={12} /> Durée (min)</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="input"
                  value={s.duration_minutes}
                  onChange={(e) => update(s.id, { duration_minutes: Number(e.target.value) })}
                  data-testid={`coach-svc-duration-${s.id}`}
                />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Tag size={12} /> Tarif (TND)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="input"
                  value={s.price}
                  onChange={(e) => update(s.id, { price: Number(e.target.value) as any })}
                  data-testid={`coach-svc-price-${s.id}`}
                />
                <p className="text-[11px] text-ink-muted mt-1">Mettre 0 pour afficher « Tarif sur demande »</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={s.active}
                  onChange={(e) => update(s.id, { active: e.target.checked })}
                  data-testid={`coach-svc-active-${s.id}`}
                />
                <span>{s.active ? "Visible sur le site" : "Masqué"}</span>
              </label>
              <button
                onClick={() => save(s)}
                disabled={savingId === s.id}
                className="btn-primary text-sm"
                data-testid={`coach-svc-save-${s.id}`}
              >
                {savingId === s.id ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Enregistrer</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
