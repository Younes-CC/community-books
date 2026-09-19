"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { bookImageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

export function ImageDropzone({
  name,
  initialPath,
}: {
  name: string;
  initialPath: string | null;
}) {
  const [path, setPath] = useState<string | null>(initialPath);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Bitte eine Bilddatei auswählen.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Die Datei darf maximal 10 MB groß sein.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectPath = `${crypto.randomUUID()}.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("book-images")
      .upload(objectPath, file, { cacheControl: "3600", upsert: false });

    setUploading(false);

    if (uploadError) {
      setError("Upload fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }

    setPath(objectPath);
  }

  const previewUrl = localPreview ?? bookImageUrl(path);

  return (
    <div>
      <input type="hidden" name={name} value={path ?? ""} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "relative flex aspect-[3/4] w-40 items-center justify-center overflow-hidden rounded-[2px] border-2 border-dashed bg-paper-alt transition-colors",
          dragOver ? "border-forest" : "border-line-strong",
        )}
      >
        {previewUrl ? (
          <>
            <Image src={previewUrl} alt="Buchcover" fill className="object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <Loader2 className="h-5 w-5 animate-spin text-paper" />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setPath(null);
                setLocalPreview(null);
              }}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1 text-paper hover:bg-ink"
              aria-label="Bild entfernen"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 px-4 text-center text-ink-faint"
          >
            <Upload className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-xs">Bild hierher ziehen oder auswählen</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!previewUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs text-ink-muted underline hover:text-ink"
        >
          Datei auswählen
        </button>
      )}

      {error && <p className="mt-2 text-xs text-brick">{error}</p>}
    </div>
  );
}
