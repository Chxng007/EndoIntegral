import { useMemo, useState } from "react";
import { Download, Pencil, Save, Trash2 } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Field,
  Loading,
  Modal,
  Notice,
  useToast,
} from "../../components/ui";
import { VideoSlot } from "../../components/video/Video";
import { useAuth } from "../../lib/auth";
import { supabase, result } from "../../lib/supabase";
import { dateLabel, today, useRows } from "../../lib/hooks";
import { moods, symptomOptions } from "../../lib/content/recursos";
import { VideoEmbed } from "../../components/video/Video";
import { videos } from "../../lib/videos";
const fresh = () => ({
  fecha: today(),
  dia_ciclo: "",
  dolor: 0,
  animo: "Regular",
  sintomas: [],
  notas: "",
});
export default function Sintomas() {
  const { user } = useAuth();
  const { rows, loading, error, refresh } = useRows("symptom_logs", {
    order: "fecha",
  });
  const [form, setForm] = useState(fresh),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [month, setMonth] = useState(today().slice(0, 7)),
    [remove, setRemove] = useState(null),
    [relief, setRelief] = useState(false);
  const toast = useToast();
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const filtered = useMemo(
    () => rows.filter((r) => r.fecha.startsWith(month)),
    [rows, month],
  );
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      if (form.fecha > today())
        throw new Error("Elige hoy o una fecha anterior.");
      await result(
        supabase.from("symptom_logs").upsert(
          {
            ...form,
            user_id: user.id,
            dia_ciclo: form.dia_ciclo ? Number(form.dia_ciclo) : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,fecha" },
        ),
      );
      toast("Tu registro quedó guardado.");
      setRelief(form.dolor >= 6);
      await refresh();
      setMonth(form.fecha.slice(0, 7));
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  function changeDate(date) {
    const existing = rows.find((r) => r.fecha === date);
    setForm(
      existing
        ? {
            fecha: existing.fecha,
            dia_ciclo: existing.dia_ciclo || "",
            dolor: existing.dolor,
            animo: existing.animo,
            sintomas: existing.sintomas || [],
            notas: existing.notas || "",
          }
        : { ...fresh(), fecha: date },
    );
  }
  return (
    <>
      <MemberTitle
        title="Escucha a tu"
        accent="cuerpo"
        description="Un registro a la vez. Identifica cómo te sientes y lleva tus notas a la consulta."
      />
      <div className="no-print">
        <form className="form-card" onSubmit={save}>
          <h2>Tu registro de hoy</h2>
          <p style={{ fontSize: 12, marginBottom: 25 }}>
            Toma solo 2 minutos completarlo.
          </p>
          <div className="form-grid">
            <Field label="Fecha">
              <input
                type="date"
                value={form.fecha}
                max={today()}
                required
                onChange={(e) => changeDate(e.target.value)}
              />
            </Field>
            <Field label="Día del ciclo (opcional)">
              <input
                type="number"
                min={1}
                max={60}
                value={form.dia_ciclo}
                placeholder="Ej: 14"
                onChange={(e) => set("dia_ciclo", e.target.value)}
              />
            </Field>
          </div>
          <fieldset style={{ border: 0, padding: 0, marginTop: 25 }}>
            <legend className="form-legend">
              Nivel de dolor pélvico · 0 = sin dolor · 10 = insoportable
            </legend>
            <div className="pain-options">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={form.dolor === n}
                  aria-label={`Dolor ${n} de 10`}
                  onClick={() => set("dolor", n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset style={{ border: 0, padding: 0 }}>
            <legend className="form-legend">¿Cómo está tu ánimo?</legend>
            <div className="chips">
              {moods.map((m) => (
                <button
                  type="button"
                  className="chip"
                  key={m}
                  aria-pressed={form.animo === m}
                  onClick={() => set("animo", m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset style={{ border: 0, padding: 0 }}>
            <legend className="form-legend">Síntomas presentes hoy</legend>
            <div className="chips">
              {symptomOptions.map((s) => (
                <button
                  type="button"
                  className="chip"
                  key={s}
                  aria-pressed={form.sintomas.includes(s)}
                  onClick={() =>
                    set(
                      "sintomas",
                      form.sintomas.includes(s)
                        ? form.sintomas.filter((x) => x !== s)
                        : [...form.sintomas, s],
                    )
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Notas adicionales">
            <textarea
              maxLength={2000}
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="¿Algo que quieras recordar? Medicación, actividad, estrés…"
            />
          </Field>
          {failure && <Notice tone="error">{failure}</Notice>}
          <Button type="submit" disabled={busy}>
            <Save size={15} />
            {busy ? "Guardando…" : "Guardar registro"}
          </Button>
        </form>
        {relief && (
          <section className="relief-card" aria-live="polite">
            <p className="eyebrow">UNA PAUSA PARA TI</p>
            <h2>
              Hoy tu cuerpo pide <em>calma.</em>
            </h2>
            <p>
              Registraste un dolor alto. Si te sientes con ánimo, esta
              meditación breve puede acompañarte. Si el dolor es intenso o
              inusual, busca atención médica.
            </p>
            <div className="video-grid">
              <VideoEmbed {...videos.dolor} />
              <VideoEmbed {...videos.calma} />
            </div>
            <Button to="/app/recursos/mindfulness" variant="plain" arrow>
              Ver más meditaciones
            </Button>
          </section>
        )}
      </div>
      <div className="history-filter">
        <h2>
          Tu mes, <em>a tu ritmo.</em>
        </h2>
        <div className="button-row">
          <input
            aria-label="Filtrar registros por mes"
            type="month"
            max={today().slice(0, 7)}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => window.print()}
            disabled={!filtered.length}
          >
            <Download size={14} />
            Exportar a PDF
          </Button>
        </div>
      </div>
      <p style={{ fontSize: 11 }}>
        Resumen descriptivo de tus registros. No es una interpretación clínica.
        Al exportar, elige «Guardar como PDF».
      </p>
      {filtered.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 23 }}>Dolor registrado · {month}</h3>
          <svg
            className="pain-chart"
            viewBox="0 0 640 160"
            role="img"
            aria-label={`Gráfica de dolor: ${[...filtered]
              .reverse()
              .map((l) => `${l.fecha}: ${l.dolor} de 10`)
              .join("; ")}`}
          >
            <line x1="30" y1="130" x2="625" y2="130" stroke="#e9ddeb" />
            <line
              x1="30"
              y1="20"
              x2="625"
              y2="20"
              stroke="#eee4ef"
              strokeDasharray="4"
            />
            <text className="chart-label" x="8" y="25">
              10
            </text>
            <text className="chart-label" x="13" y="133">
              0
            </text>
            <polyline
              fill="none"
              stroke="#a37ab5"
              strokeWidth="2.5"
              points={[...filtered]
                .reverse()
                .map(
                  (l) =>
                    `${30 + (Number(l.fecha.slice(-2)) - 1) * 19.5},${130 - l.dolor * 11}`,
                )
                .join(" ")}
            />
            {filtered.map((l) => (
              <g key={l.id}>
                <circle
                  cx={30 + (Number(l.fecha.slice(-2)) - 1) * 19.5}
                  cy={130 - l.dolor * 11}
                  r="4"
                  fill="#a37ab5"
                />
                <text
                  className="chart-label"
                  x={27 + (Number(l.fecha.slice(-2)) - 1) * 19.5}
                  y="150"
                >
                  {Number(l.fecha.slice(-2))}
                </text>
              </g>
            ))}
          </svg>
          <p style={{ fontSize: 11 }}>
            Síntomas registrados:{" "}
            {symptomOptions
              .map((s) => [
                s,
                filtered.filter((r) => r.sintomas.includes(s)).length,
              ])
              .filter(([, n]) => n)
              .map(([s, n]) => `${s}: ${n}`)
              .join(" · ") || "No se seleccionaron síntomas."}
          </p>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : !filtered.length ? (
        <div style={{ marginTop: 25 }}>
          <EmptyState title="Cada registro es un paso">
            Aún no hay registros en este mes.
          </EmptyState>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((log) => (
            <article className="history-entry" key={log.id}>
              <div className="date-tile">
                {Number(log.fecha.slice(-2))}
                <small>
                  {new Date(`${log.fecha}T12:00:00`).toLocaleDateString(
                    "es-CO",
                    { month: "short" },
                  )}
                </small>
              </div>
              <div>
                <h3>
                  Dolor: {log.dolor}/10 · Ánimo: {log.animo}
                </h3>
                <p>
                  {log.sintomas.join(" · ") || "Sin síntomas seleccionados"}
                </p>
                {log.notas && <p style={{ marginTop: 8 }}>{log.notas}</p>}
              </div>
              <div className="history-actions">
                <button
                  aria-label={`Editar registro del ${dateLabel(log.fecha)}`}
                  className="icon-button"
                  onClick={() => {
                    changeDate(log.fecha);
                    document
                      .querySelector("form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={`Eliminar registro del ${dateLabel(log.fecha)}`}
                  className="icon-button"
                  onClick={() => setRemove(log)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="no-print" style={{ marginTop: 30 }}>
        <VideoSlot name="sintomas_tutorial" compact />
      </div>
      {remove && (
        <Modal title="¿Eliminar este registro?" onClose={() => setRemove(null)}>
          <p>Se eliminará el registro del {dateLabel(remove.fecha)}.</p>
          <div className="button-row">
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await result(
                    supabase.from("symptom_logs").delete().eq("id", remove.id),
                  );
                  setRemove(null);
                  await refresh();
                  toast("Registro eliminado.");
                } catch (e) {
                  toast(e.message, "error");
                }
              }}
            >
              Eliminar
            </Button>
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Conservar
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
