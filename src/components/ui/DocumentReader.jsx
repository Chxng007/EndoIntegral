import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import { Button } from "./index";
// Lector página por página (funciona igual en celular, donde un PDF incrustado no se ve bien),
// con miniaturas, flechas del teclado y botones para descargar o imprimir el PDF.
// `doc.pages` son enlaces firmados del bucket privado (ver src/lib/documents.js).
export default function DocumentReader({ doc }) {
  const total = doc.pages.length;
  const [page, setPage] = useState(1);
  const thumbs = useRef(null);
  const go = (n) => setPage(Math.min(total, Math.max(1, n)));
  useEffect(() => {
    const key = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(total, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [total]);
  // Mantiene visible la miniatura activa y precarga la página siguiente.
  useEffect(() => {
    const box = thumbs.current,
      active = box?.querySelector('[aria-current="page"]');
    if (active && box) {
      const a = active.getBoundingClientRect(),
        b = box.getBoundingClientRect();
      box.scrollTo({
        left: box.scrollLeft + a.left - b.left - (b.width - a.width) / 2,
        behavior: "smooth",
      });
    }
    if (page < total) new Image().src = doc.pages[page];
  }, [page, total, doc.pages]);
  const actions = (
    <div className="button-row">
      <Button href={doc.downloadUrl} variant="secondary">
        <Download size={15} />
        Descargar PDF
      </Button>
      <Button href={doc.pdf} target="_blank" rel="noreferrer" variant="plain">
        <Printer size={15} />
        Abrir para imprimir
      </Button>
    </div>
  );
  return (
    <section className="doc-reader" aria-label={doc.title}>
      <div className="doc-toolbar">
        <div>
          <strong>{doc.title}</strong>
          <span>{doc.subtitle}</span>
        </div>
        {actions}
      </div>
      {total > 0 && (
        <>
          <div className="doc-stage">
            <button
              className="doc-nav"
              onClick={() => go(page - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <img
              key={page}
              className="doc-page"
              src={doc.pages[page - 1]}
              alt={`${doc.title}, página ${page} de ${total}`}
              style={{ aspectRatio: doc.ratio }}
            />
            <button
              className="doc-nav"
              onClick={() => go(page + 1)}
              disabled={page === total}
              aria-label="Página siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <p className="doc-count" aria-live="polite">
            Página {page} de {total}
          </p>
          <div className="doc-thumbs" ref={thumbs}>
            {doc.pages.map((src, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                aria-label={`Ir a la página ${i + 1}`}
                aria-current={i + 1 === page ? "page" : undefined}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{ aspectRatio: doc.ratio }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
