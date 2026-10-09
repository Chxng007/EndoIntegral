import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
// Los documentos (cartilla, diario, yoga, mindfulness) están en el bucket privado «resources».
// Solo se pueden abrir con sesión y un plan que incluya el módulo (políticas en
// 202610090012_protected_documents.sql). La página pide enlaces firmados temporales.
const TTL = 60 * 60; // segundos que dura cada enlace firmado
const pageName = (n) => `p${String(n).padStart(2, "0")}.webp`;
// Nombre del archivo al descargar, sin tildes ni espacios (se ve igual en todos los navegadores).
const fileName = (r) =>
  `${r.titulo} endointegral`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + ".pdf";
export function useResourceDocument(category) {
  const [state, setState] = useState({ status: "loading" });
  const load = useCallback(async () => {
    if (!supabase) return setState({ status: "empty" });
    setState((s) => (s.status === "ready" ? s : { status: "loading" }));
    const { data: r, error } = await supabase
      .from("resources")
      .select("*")
      .eq("categoria", category)
      .order("orden")
      .limit(1)
      .maybeSingle();
    if (error) return setState({ status: "error" });
    if (!r) return setState({ status: "empty" });
    const bucket = supabase.storage.from("resources");
    const pagePaths = r.carpeta
      ? Array.from(
          { length: r.paginas || 0 },
          (_, i) => `${r.carpeta}/${pageName(i + 1)}`,
        )
      : [];
    const [view, download, pages] = await Promise.all([
      bucket.createSignedUrl(r.pdf_path, TTL),
      bucket.createSignedUrl(r.pdf_path, TTL, { download: fileName(r) }),
      pagePaths.length
        ? bucket.createSignedUrls(pagePaths, TTL)
        : Promise.resolve({ data: [] }),
    ]);
    if (view.error || download.error || pages.error)
      return setState({ status: "error" });
    setState({
      status: "ready",
      doc: {
        title: r.titulo,
        subtitle: r.descripcion,
        ratio: r.proporcion || "3 / 4",
        pdf: view.data.signedUrl,
        downloadUrl: download.data.signedUrl,
        pages: (pages.data || []).map((p) => p.signedUrl),
      },
    });
  }, [category]);
  useEffect(() => {
    load();
    // Renueva los enlaces antes de que caduquen si la página queda abierta mucho tiempo.
    const timer = setInterval(load, (TTL - 120) * 1000);
    return () => clearInterval(timer);
  }, [load]);
  return state;
}
