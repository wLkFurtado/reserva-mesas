import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string; // e.g. "reservas/troia"
  label?: string;
}

const extractPathFromPublicUrl = (url: string): string | null => {
  const marker = "/storage/v1/object/public/imagens/";
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : null;
};

export const ImageUploadField = ({ value, onChange, folder = "reservas", label = "Anexo (imagem)" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WEBP.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "Imagem muito grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("imagens").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("imagens").getPublicUrl(path);

      // best-effort: remove anexo anterior
      if (value) {
        const oldPath = extractPathFromPublicUrl(value);
        if (oldPath) await supabase.storage.from("imagens").remove([oldPath]);
      }

      onChange(data.publicUrl);
      toast({ title: "Imagem enviada" });
    } catch (e: any) {
      toast({ title: "Erro no upload", description: e?.message ?? "Falha ao enviar", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    const path = extractPathFromPublicUrl(value);
    if (path) {
      await supabase.storage.from("imagens").remove([path]);
    }
    onChange(null);
    toast({ title: "Imagem removida" });
  };

  return (
    <div>
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {value ? (
        <div className="mt-1 flex items-center gap-3 rounded-md border bg-muted/20 p-2">
          <a href={value} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <img src={value} alt="Anexo" className="h-16 w-16 rounded object-cover border" />
          </a>
          <div className="flex-1 text-xs text-muted-foreground truncate">
            <a href={value} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              Ver imagem em nova aba
            </a>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trocar"}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={handleRemove} title="Remover" disabled={uploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 w-full justify-start gap-2 text-muted-foreground font-normal"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Enviando..." : "Anexar imagem (JPG/PNG/WEBP, máx 5MB)"}
        </Button>
      )}
      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
        <ImageIcon className="h-3 w-3" /> A imagem ficará acessível por link público.
      </p>
    </div>
  );
};
