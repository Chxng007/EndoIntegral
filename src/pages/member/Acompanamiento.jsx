import { useState } from "react";
import { HeartHandshake, Send } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Field,
  Notice,
  useToast,
} from "../../components/ui";
import { VideoEmbed, VideoSlot } from "../../components/video/Video";
import { useAuth } from "../../lib/auth";
import { dateLabel, useRows } from "../../lib/hooks";
import { supabase, result } from "../../lib/supabase";
export default function Acompanamiento() {
  const { user, profile } = useAuth();
  const { rows: professionals } = useRows("professionals", {
    order: "nombre",
    ascending: true,
  });
  const { rows, refresh, error } = useRows("appointment_requests");
  const [preferred, setPreferred] = useState(""),
    [busy, setBusy] = useState(false);
  const toast = useToast();
  async function submit(e) {
    e.preventDefault();
    const el = e.currentTarget,
      values = Object.fromEntries(new FormData(el));
    setBusy(true);
    try {
      await result(
        supabase.from("appointment_requests").insert({
          user_id: user.id,
          professional_id: preferred || null,
          telefono: values.telefono,
          modalidad: values.modalidad,
          horario: values.horario,
          motivo: values.motivo,
        }),
      );
      toast("Solicitud enviada al equipo. Te contactaremos para coordinar tu sesión.");
      el.reset();
      setPreferred("");
      refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <MemberTitle
        eyebrow="APOYO PROFESIONAL"
        title="Acompañamiento"
        accent="emocional"
        description="Un espacio para escucharte, reconocer lo que estás viviendo y buscar apoyo profesional."
      />
      {professionals.filter((p) => p.activo).length ? (
        <div className="two-col">
          {professionals
            .filter((p) => p.activo)
            .map((p) => (
              <article className="card" key={p.id}>
                {p.foto_url ? (
                  <img
                    src={p.foto_url}
                    alt={p.nombre}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginBottom: 20,
                    }}
                  />
                ) : (
                  <span className="icon-disc">
                    <HeartHandshake />
                  </span>
                )}
                <h3>{p.nombre}</h3>
                <p style={{ fontSize: 11 }}>
                  {p.cargo}
                  {p.anios_experiencia
                    ? ` · ${p.anios_experiencia} años de experiencia`
                    : ""}
                </p>
                <div className="chips" style={{ marginTop: 15 }}>
                  {p.especialidades?.map((s) => (
                    <span className="badge" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
                <p>{p.bio}</p>
                <div style={{ margin: "20px 0" }}>
                  {p.video_id ? (
                    <VideoEmbed
                      id={p.video_id}
                      title={`Conoce a ${p.nombre}`}
                    />
                  ) : (
                    <VideoSlot
                      title={`Conoce a ${p.nombre}`}
                      name={`profesional_${p.id}`}
                      compact
                    />
                  )}
                </div>
                <Button
                  onClick={() => {
                    setPreferred(p.id);
                    document
                      .getElementById("solicitud")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Solicitar sesión
                </Button>
              </article>
            ))}
        </div>
      ) : (
        <EmptyState
          icon={HeartHandshake}
          title="El equipo te ayudará a encontrar apoyo"
        >
          Puedes enviar una solicitud sin elegir profesional. Confirmaremos
          contigo la disponibilidad.
        </EmptyState>
      )}
      <form
        id="solicitud"
        className="form-card"
        style={{ marginTop: 30 }}
        onSubmit={submit}
      >
        <h2>Solicitar una sesión de orientación</h2>
        <div className="form-grid">
          <Field label="Nombre completo">
            <input value={profile?.nombre || ""} readOnly />
          </Field>
          <Field label="Correo electrónico">
            <input value={user?.email || ""} readOnly />
          </Field>
          <Field label="Teléfono (opcional)">
            <input
              name="telefono"
              type="tel"
              maxLength={20}
              placeholder="+57 300 000 0000"
            />
          </Field>
          <Field label="Profesional preferida">
            <select
              value={preferred}
              onChange={(e) => setPreferred(e.target.value)}
            >
              <option value="">Sin preferencia</option>
              {professionals
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Modalidad">
            <select name="modalidad">
              <option>Videollamada</option>
              <option>Presencial</option>
              <option>Llamada telefónica</option>
            </select>
          </Field>
          <Field label="Horario preferido">
            <select name="horario">
              <option>Mañana (8–12 h)</option>
              <option>Tarde (12–18 h)</option>
              <option>Noche (18–20 h)</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 22 }}>
          <Field label="¿Qué te motivó a contactarnos?">
            <textarea
              name="motivo"
              required
              minLength={10}
              maxLength={2000}
              placeholder="Cuéntanos brevemente qué estás viviendo…"
            />
          </Field>
        </div>
        <Notice>
          Tu solicitud llega directamente al correo del equipo EndoIntegral. La
          sesión queda agendada cuando te contactemos y confirmemos fecha,
          modalidad y condiciones contigo.
        </Notice>
        <Button type="submit" disabled={busy}>
          <Send size={15} />
          {busy ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </form>
      <div style={{ marginTop: 35 }}>
        <h2 style={{ fontSize: 30 }}>Mis solicitudes</h2>
        {error && <Notice tone="error">{error}</Notice>}
        {rows.map((r) => (
          <div className="history-entry" key={r.id}>
            <div>
              <h3>{dateLabel(r.created_at)}</h3>
              <p>
                {r.modalidad} · {r.horario}
              </p>
            </div>
            <span className="badge" style={{ marginLeft: "auto" }}>
              {r.estado}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
