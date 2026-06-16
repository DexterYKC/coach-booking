"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { priceFR } from "@/lib/utils";
import { ImageUploader } from "@/components/ImageUploader";
import type { Service } from "@/types/database";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState({ name: "", description: "", duration_minutes: 60, price: 0, sort_order: 99 });

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/services");
    const j = await r.json();
    setServices(j.services || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add() {
    if (!creating.name) return toast.error("Nom requis");
    const r = await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(creating) });
    if (!r.ok) toast.error("Erreur"); else { toast.success("Service ajouté"); setCreating({ name: "", description: "", duration_minutes: 60, price: 0, sort_order: 99 }); }
    refresh();
  }

  async function patch(id: string, body: any) {
    const r = await fetch(`/api/services/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) toast.error("Erreur"); else toast.success("Sauvegardé");
    refresh();
  }
  async function del(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div data-testid="admin-services-page">
      <h1 className="heading text-3xl font-bold">Services</h1>
      <p className="text-ink-muted mt-1">Gérez les services réservables sur la page d&apos;accueil.</p>

      <div className="card mt-6" data-testid="add-service-form">
        <h2 className="heading font-semibold mb-4">Nouveau service</h2>
        <div className="grid sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2"><label className="label">Nom</label><input className="input" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} data-testid="new-service-name" /></div>
          <div><label className="label">Durée (min)</label><input type="number" className="input" value={creating.duration_minutes} onChange={(e) => setCreating({ ...creating, duration_minutes: Number(e.target.value) })} data-testid="new-service-duration" /></div>
          <div><label className="label">Prix (TND)</label><input type="number" className="input" value={creating.price} onChange={(e) => setCreating({ ...creating, price: Number(e.target.value) })} data-testid="new-service-price" /></div>
          <button onClick={add} className="btn-primary" data-testid="new-service-add-btn"><Plus size={16} /> Ajouter</button>
        </div>
        <div className="mt-3"><label className="label">Description</label><textarea rows={2} className="input" value={creating.description} onChange={(e) => setCreating({ ...creating, description: e.target.value })} data-testid="new-service-desc" /></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {loading && <Loader2 className="animate-spin text-brand mx-auto" />}
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} onSave={(body) => patch(s.id, body)} onDelete={() => del(s.id)} />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, onSave, onDelete }: { service: Service; onSave: (body: any) => void; onDelete: () => void }) {
  const [edit, setEdit] = useState(service);

  async function setImage(url: string) {
    setEdit((e) => ({ ...e, image_url: url }));
    onSave({ image_url: url });
  }
  async function removeImage() {
    const path = extractPath(edit.image_url || "", "service-images");
    setEdit((e) => ({ ...e, image_url: null }));
    onSave({ image_url: null });
    if (path) await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: "service-images", path }) });
  }

  return (
    <div className="card" data-testid={`svc-card-${service.id}`}>
      <ImageUploader
        bucket="service-images"
        folder={service.id}
        currentUrl={edit.image_url}
        onUploaded={setImage}
        onRemoved={removeImage}
        testId={`svc-image-${service.id}`}
        label="Ajouter une image pour ce service"
      />
      <input className="input font-display text-lg font-semibold mt-3" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} data-testid={`svc-name-${service.id}`} />
      <textarea rows={2} className="input mt-2" value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} data-testid={`svc-desc-${service.id}`} />
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div><label className="label text-xs">Durée</label><input type="number" className="input" value={edit.duration_minutes} onChange={(e) => setEdit({ ...edit, duration_minutes: Number(e.target.value) })} data-testid={`svc-duration-${service.id}`} /></div>
        <div><label className="label text-xs">Prix</label><input type="number" className="input" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} data-testid={`svc-price-${service.id}`} /></div>
        <div><label className="label text-xs">Ordre</label><input type="number" className="input" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} data-testid={`svc-order-${service.id}`} /></div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} data-testid={`svc-active-${service.id}`} />
          Actif <span className="text-xs text-ink-muted ml-2">{priceFR(edit.price)}</span>
        </label>
        <div className="flex gap-2">
          <button onClick={() => onSave(edit)} className="btn-primary text-xs" data-testid={`svc-save-${service.id}`}><Save size={14} /> Sauver</button>
          <button onClick={onDelete} className="btn-danger text-xs" data-testid={`svc-delete-${service.id}`}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function extractPath(publicUrl: string, bucket: string): string | null {
  const idx = publicUrl.indexOf(`/${bucket}/`);
  if (idx < 0) return null;
  return publicUrl.substring(idx + bucket.length + 2);
}
