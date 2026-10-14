import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Printer,
  X,
} from "lucide-react";
import { Button } from "./index";
import { useReducedMotion } from "../../lib/hooks";
const TURN_MS = 760;
// Lector tipo cartilla: la hoja gira sobre el lomo al pasar de página (con su reverso y sombra),
// miniaturas, flechas del teclado, vista ampliada para leer el texto pequeño y botones para
// descargar o imprimir. `doc.pages` son enlaces firmados del bucket privado (src/lib/documents.js).
export default function DocumentReader({ doc }) {
  const total = doc.pages.length;
  const [page, setPage] = useState(1);
  // Hoja que está girando: from → to; dir 1 = adelante, -1 = atrás.
  const [turn, setTurn] = useState(null);
  const [zoom, setZoom] = useState(false);
  const reduced = useReducedMotion();
  const thumbs = useRef(null);
  const [w, h] = String(doc.ratio || "3 / 4")
    .split("/")
    .map((n) => Number(n.trim()) || 1);
  const go = useCallback(
    (target) => {
      const to = Math.min(total, Math.max(1, target));
      if (to === page || turn) return;
      if (reduced) {
        setPage(to);
        return;
      }
      setTurn({ from: page, to, dir: to > page ? 1 : -1 });
      setPage(to);
    },
    [page, total, turn, reduced],
  );
  // Si el navegador no dispara animationend (pestaña oculta), la hoja se termina igual.
  useEffect(() => {
    if (!turn) return;
    const t = setTimeout(() => setTurn(null), TURN_MS + 120);
    return () => clearTimeout(t);
  }, [turn]);
  useEffect(() => {
    const key = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
      if (e.key === "Escape") setZoom(false);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [go, page]);
  // Mantiene visible la miniatura activa y precarga las páginas vecinas.
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
    [page + 1, page - 1].forEach((n) => {
      if (n >= 1 && n <= total) new Image().src = doc.pages[n - 1];
    });
  }, [page, total, doc.pages]);
  const src = (n) => doc.pages[n - 1];
  // Debajo queda la página que se verá al terminar (adelante) o la que se está tapando (atrás).
  const under = turn ? (turn.dir === 1 ? turn.to : turn.from) : page;
  const leaf = turn && (turn.dir === 1 ? turn.from : turn.to);
  return (
    <section className="doc-reader" aria-label={doc.title}>
      <div className="doc-toolbar">
        <div>
          <strong>{doc.title}</strong>
          <span>{doc.subtitle}</span>
        </div>
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
      </div>
      {total > 0 && (
        <>
          <div className="doc-stage">
            <button
              className="doc-nav"
              onClick={() => go(page - 1)}
              disabled={page === 1 || Boolean(turn)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <div
              className={`doc-book ${turn ? "is-turning" : ""}`}
              style={{
                aspectRatio: `${w} / ${h}`,
                width: `min(100%, 760px, calc(82vh * ${w / h}))`,
              }}
            >
              <button
                className="doc-sheet"
                onClick={() => setZoom(true)}
                aria-label={`Ampliar la página ${page}`}
              >
                <img
                  src={src(under)}
                  alt={`${doc.title}, página ${page} de ${total}`}
                />
                <span className="doc-zoom-hint" aria-hidden="true">
                  <Maximize2 size={14} /> Ampliar
                </span>
              </button>
              {turn && (
                <div
                  className={`doc-leaf ${turn.dir === 1 ? "turn-next" : "turn-prev"}`}
                  style={{ animationDuration: `${TURN_MS}ms` }}
                  onAnimationEnd={(e) => {
                    if (e.target === e.currentTarget) setTurn(null);
                  }}
                  aria-hidden="true"
                >
                  <div className="doc-leaf-front">
                    <img src={src(leaf)} alt="" />
                  </div>
                  <div className="doc-leaf-back" />
                </div>
              )}
              {turn && (
                <span
                  className={`doc-shade ${turn.dir === 1 ? "shade-next" : "shade-prev"}`}
                  style={{ animationDuration: `${TURN_MS}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <button
              className="doc-nav"
              onClick={() => go(page + 1)}
              disabled={page === total || Boolean(turn)}
              aria-label="Página siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <p className="doc-count" aria-live="polite">
            Página {page} de {total}
          </p>
          <div className="doc-thumbs" ref={thumbs}>
            {doc.pages.map((url, i) => (
              <button
                key={i}
                onClick={() => go(i + 1)}
                aria-label={`Ir a la página ${i + 1}`}
                aria-current={i + 1 === page ? "page" : undefined}
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  style={{ aspectRatio: `${w} / ${h}` }}
                />
              </button>
            ))}
          </div>
        </>
      )}
      {zoom && (
        <div
          className="doc-zoom"
          role="dialog"
          aria-modal="true"
          aria-label={`${doc.title}, página ${page} ampliada`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoom(false);
          }}
        >
          <div className="doc-zoom-bar">
            <span>
              Página {page} de {total}
            </span>
            <div className="button-row">
              <button
                onClick={() => go(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => go(page + 1)}
                disabled={page === total}
                aria-label="Página siguiente"
              >
                <ChevronRight size={20} />
              </button>
              <button onClick={() => setZoom(false)} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="doc-zoom-scroll">
            <img src={src(page)} alt={`${doc.title}, página ${page}`} />
          </div>
        </div>
      )}
    </section>
  );
}
