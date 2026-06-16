"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Props {
  bucket: "user-avatars" | "coach-images" | "service-images";
  folder: string;
  currentUrl?: string | null;
  maxSizeMB?: number;
  onUploaded: (publicUrl: string, path: string) => Promise<void> | void;
  onRemoved?: () => Promise<void> | void;
  label?: string;
  testId?: string;
  shape?: "round" | "square";
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  bucket,
  folder,
  currentUrl,
  maxSizeMB = 5,
  onUploaded,
  onRemoved,
  label = "Glissez une image ou cliquez pour téléverser",
  testId = "image-uploader",
  shape = "square"
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || !files.length) return;
    const file = files[0];
    if (!ACCEPT.includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG ou WEBP)");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${maxSizeMB}MB)`);
      return;
    }
    setBusy(true);
    setProgress(10);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("folder", folder);
      setProgress(40);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      setProgress(80);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec du téléversement");
      setProgress(100);
      await onUploaded(json.publicUrl, json.path);
      toast.success("Image téléversée");
    } catch (e: any) {
      toast.error(e.message || "Erreur de téléversement");
    } finally {
      setTimeout(() => { setBusy(false); setProgress(0); }, 400);
    }
  }

  return (
    <div className="w-full" data-testid={testId}>
      <div
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer transition-all overflow-hidden p-6",
          drag ? "border-brand bg-brand-50" : "border-slate-200 hover:border-brand",
          shape === "round" ? "rounded-full aspect-square w-40 h-40 mx-auto" : "min-h-[180px]"
        )}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt="preview"
            fill
            sizes="200px"
            className={cn("object-cover", shape === "round" ? "rounded-full" : "rounded-2xl")}
          />
        ) : (
          <div className="text-center pointer-events-none">
            <Upload className="mx-auto mb-2 text-brand" size={24} />
            <div className="text-sm font-medium text-ink">{label}</div>
            <div className="text-xs text-ink-muted mt-1">JPG · PNG · WEBP — max {maxSizeMB}MB</div>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-brand" size={24} />
            <div className="w-3/4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          data-testid={`${testId}-input`}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {currentUrl && onRemoved && (
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Supprimer cette image ?")) return;
            await onRemoved();
          }}
          className="mt-3 text-xs text-rose-600 hover:underline inline-flex items-center gap-1"
          data-testid={`${testId}-remove`}
        >
          <X size={14} /> Supprimer
        </button>
      )}
    </div>
  );
}
