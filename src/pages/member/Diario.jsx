import { useState } from "react";
import { Download, Save, Trash2 } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Field,
  Modal,
  Notice,
  useToast,
} from "../../components/ui";
import { VideoSlot } from "../../components/video/Video";
import { useAuth } from "../../lib/auth";
import { dateLabel, today, useRows } from "../../lib/hooks";
import { result, supabase } from "../../lib/supabase";
import { moods } from "../../lib/content/recursos";
import { ResourceDocument } from "./Recursos";
export default function Diario() {
  const { user } = useAuth();
  const { rows, refresh, error } = useRows("journal_entries");
  const { rows: prompts } = useRows("journal_prompts", {
    order: "orden",
    ascending: true,
  });
  const [tab, setTab] = useState("online"),
    [busy, setBusy] = useState(false),
    [remove, setRemove] = useState(null);
  const toast = useToast();
  async function save(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const f = new FormData(el);
    setBusy(true);
    try {
      await result(
        supabase.from("journal_entries").insert({
          user_id: user.id,
          fecha: f.get("fecha"),
          emocion: f.get("emocion"),
          texto_libre: f.get("texto_libre"),
          respuestas: Object.fromEntries(
            prompts
              .filter((p) => p.activo)
              .map((p) => [p.id, f.get(`prompt-${p.id}`) || ""]),
          ),
        }),
      );
      el.reset();
      toast("Tu entrada quedó guardada, solo para ti.");
      await refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <MemberTitle
        title="Un lugar para"
        accent="lo que sientes"
        description="No hay respuestas correctas. Este espacio es privado y puedes escribir a tu manera."
      />
      <div className="chips no-print journal-modes">
        <button
          className="chip"
          aria-pressed={tab === "online"}
          onClick={() => setTab("online")}
        >
          Llenar en línea
        </button>
        <button
          className="chip"
          aria-pressed={tab === "pdf"}
          onClick={() => setTab("pdf")}
        >
          Descargar e imprimir
        </button>
      </div>
      {tab === "pdf" ? (
        <ResourceDocument category="diario" title="Diario terapéutico" />
      ) : (
        <>
          <form onSubmit={save} className="form-card no-print">
            <h2>¿Qué necesitas expresar hoy?</h2>
            <div className="form-grid">
              <Field label="Fecha">
                <input
                  type="date"
                  name="fecha"
                  defaultValue={today()}
                  max={today()}
                  required
                />
              </Field>
              <Field label="Emoción del día">
                <select name="emocion">
                  {moods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: 22 }}>
              {prompts
                .filter((p) => p.activo)
                .map((p) => (
                  <Field key={p.id} label={p.pregunta}>
                    <textarea name={`prompt-${p.id}`} maxLength={5000} />
                  </Field>
                ))}
              <Field label="Tu espacio libre">
                <textarea
                  name="texto_libre"
                  placeholder="Hoy me siento…"
                  rows={7}
                  required
                  maxLength={10000}
                />
              </Field>
            </div>
            <Button type="submit" disabled={busy}>
              <Save size={15} />
              {busy ? "Guardando…" : "Guardar en mi diario"}
            </Button>
          </form>
          <div className="history-filter">
            <h2>
              Mis <em>palabras.</em>
            </h2>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              disabled={!rows.length}
            >
              <Download size={14} />
              Exportar a PDF
            </Button>
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          {!rows.length ? (
            <EmptyState title="Tu historia empieza contigo">
              Cuando escribas, tus entradas aparecerán aquí.
            </EmptyState>
          ) : (
            rows.map((entry) => (
              <article className="journal-entry" key={entry.id}>
                <div
                  className="button-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <h3>{dateLabel(entry.fecha)}</h3>
                  <button
                    className="icon-button no-print"
                    aria-label={`Eliminar entrada del ${dateLabel(entry.fecha)}`}
                    onClick={() => setRemove(entry.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <small>{entry.emocion}</small>
                {Object.entries(entry.respuestas || {})
                  .filter(([, v]) => v)
                  .map(([id, value]) => (
                    <div key={id}>
                      <p>
                        <strong>
                          {prompts.find((p) => p.id === id)?.pregunta ||
                            "Reflexión"}
                        </strong>
                      </p>
                      <p>{value}</p>
                    </div>
                  ))}
                <p>{entry.texto_libre}</p>
              </article>
            ))
          )}
        </>
      )}
      <div className="no-print" style={{ marginTop: 30 }}>
        <VideoSlot name="diario_tutorial" compact />
      </div>
      {remove && (
        <Modal title="¿Eliminar esta entrada?" onClose={() => setRemove(null)}>
          <p>Esta acción no se puede deshacer.</p>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await result(
                  supabase.from("journal_entries").delete().eq("id", remove),
                );
                setRemove(null);
                refresh();
                toast("Entrada eliminada.");
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          >
            Eliminar entrada
          </Button>
        </Modal>
      )}
    </>
  );
}
