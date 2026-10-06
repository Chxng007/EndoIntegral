import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Camera as Instagram, Send } from "lucide-react";
import { PageHeader } from "../../components/layout/Layout";
import { Button, Field, Notice } from "../../components/ui";
import { VideoSlot } from "../../components/video/Video";
import { supabase, formsEnabled, unavailableMessage } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
const subjects = {
  general: "Información general",
  "plan-aprende": "Solicitar Plan 1 · Aprende",
  "plan-orienta": "Solicitar Plan 2 · Orienta",
  "plan-diagnostico": "Solicitar Plan 3 · Diagnosticadas",
  acompanamiento: "Acompañamiento emocional",
  otro: "Otro",
};
export const contactSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "Escribe al menos 3 caracteres.")
      .max(80, "Máximo 80 caracteres."),
    email: z.email("Escribe un correo válido."),
    asunto: z.enum(Object.keys(subjects)),
    telefono: z
      .string()
      .refine(
        (v) => !v || /^(\+?57\s?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(v),
        "Escribe un número celular colombiano válido.",
      ),
    mensaje: z
      .string()
      .trim()
      .min(10, "Cuéntanos un poco más: mínimo 10 caracteres.")
      .max(2000, "Máximo 2000 caracteres."),
    consent: z.literal(true, {
      error: "Necesitamos tu autorización para recibir el mensaje.",
    }),
    website: z.string().max(0),
  })
  // Para solicitar un plan el equipo necesita el celular: así coordina el pago.
  .refine((v) => !v.asunto.startsWith("plan-") || Boolean(v.telefono), {
    message: "Para solicitar un plan necesitamos tu celular.",
    path: ["telefono"],
  });
export default function Contacto() {
  const [params] = useSearchParams();
  const initial = params.get("asunto");
  const [status, setStatus] = useState(null);
  const { user, profile } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      asunto: subjects[initial] ? initial : "general",
      website: "",
      telefono: "",
    },
  });
  const isPlan = watch("asunto")?.startsWith("plan-");
  // Con sesión iniciada se completan nombre y correo para que el equipo la encuentre en su cuenta.
  useEffect(() => {
    if (!user) return;
    if (!getValues("nombre") && profile?.nombre)
      setValue("nombre", profile.nombre);
    if (!getValues("email") && user.email) setValue("email", user.email);
  }, [user, profile, getValues, setValue]);
  async function send(values) {
    setStatus(null);
    if (!formsEnabled) {
      setStatus({ error: true, text: unavailableMessage });
      return;
    }
    try {
      const { error, data } = await supabase.functions.invoke("contact", {
        body: values,
      });
      if (error || data?.error)
        throw new Error(
          data?.error || "No pudimos enviar tu mensaje. Intenta nuevamente.",
        );
      setStatus({
        text: values.asunto.startsWith("plan-")
          ? "¡Solicitud recibida! El equipo te escribirá a tu celular para coordinar el pago. Cuando esté confirmado, activaremos el plan en tu cuenta y te avisaremos por correo."
          : "Mensaje recibido. El equipo revisará tu solicitud y te responderá pronto.",
      });
      reset({ asunto: "general", website: "", telefono: "" });
    } catch (e) {
      setStatus({ error: true, text: e.message });
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="ESTAMOS PARA ESCUCHARTE"
        title="Demos el primer paso,"
        accent="juntas."
        description="¿Quieres conocer el programa o necesitas orientación? Escríbenos. Tu historia tiene un lugar aquí."
      />
      <section className="container section contact-layout">
        <div>
          <form className="form-card" onSubmit={handleSubmit(send)} noValidate>
            <h2>
              {isPlan ? (
                <>
                  Solicita tu <em>plan</em>
                </>
              ) : (
                <>
                  Envíanos un <em>mensaje</em>
                </>
              )}
            </h2>
            {isPlan && (
              <p style={{ fontSize: 12, margin: "-6px 0 20px" }}>
                Tu solicitud llega al equipo de EndoIntegral. Te escribiremos al
                celular para coordinar el pago y, una vez confirmado,
                activaremos el plan en tu cuenta.{" "}
                {!user && (
                  <>
                    Usa el mismo correo con el que{" "}
                    <Link to="/ingresar?modo=registro">creaste tu cuenta</Link>{" "}
                    (o créala gratis).
                  </>
                )}
              </p>
            )}
            <div className="form-grid">
              <Field label="Nombre completo" error={errors.nombre?.message}>
                <input
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  {...register("nombre")}
                />
              </Field>
              <Field label="Correo electrónico" error={errors.email?.message}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register("email")}
                />
              </Field>
              <Field label="Asunto" error={errors.asunto?.message}>
                <select {...register("asunto")}>
                  {Object.entries(subjects).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  isPlan
                    ? "Celular (para coordinar tu plan)"
                    : "Teléfono (opcional)"
                }
                error={errors.telefono?.message}
              >
                <input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  autoComplete="tel"
                  {...register("telefono")}
                />
              </Field>
            </div>
            <div style={{ marginTop: 22 }}>
              <Field label="Tu mensaje" error={errors.mensaje?.message}>
                <textarea
                  placeholder={
                    isPlan
                      ? "Cuéntanos brevemente por qué te interesa este plan y en qué horario prefieres que te escribamos…"
                      : "Cuéntanos en qué podemos ayudarte…"
                  }
                  rows={5}
                  {...register("mensaje")}
                />
              </Field>
            </div>
            <div className="honeypot" aria-hidden="true">
              <label>
                Sitio web
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("website")}
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" {...register("consent")} />
              <span>
                He leído la{" "}
                <Link to="/privacidad">política de tratamiento de datos</Link> y
                autorizo el uso de mis datos para responder a esta consulta.
              </span>
            </label>
            {errors.consent && (
              <p className="field-error">{errors.consent.message}</p>
            )}
            <p style={{ fontSize: 10, margin: "12px 0 20px" }}>
              Evita incluir historias clínicas o datos de salud detallados en
              este formulario.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              <Send size={15} />
              {isSubmitting
                ? "Enviando…"
                : isPlan
                  ? "Enviar solicitud"
                  : "Enviar mensaje"}
            </Button>
            {status && (
              <div className="form-status">
                <Notice tone={status.error ? "error" : "success"}>
                  {status.text}
                </Notice>
              </div>
            )}
            {!formsEnabled && !status && (
              <div className="form-status">
                <Notice>
                  El formulario estará disponible próximamente. Mientras tanto,
                  puedes escribirnos por Instagram.
                </Notice>
              </div>
            )}
          </form>
        </div>
        <aside className="contact-side">
          <div className="instagram-card">
            <Instagram size={28} style={{ margin: "0 auto 18px" }} />
            <h3>
              Un poquito más <em>cerca.</em>
            </h3>
            <p>
              Encuéntranos en Instagram y acompáñanos en este camino de
              bienestar.
            </p>
            <img
              src="/img/qr-instagram.jpeg"
              alt="Código QR oficial del Instagram @endo_integral"
              width={170}
              height={183}
            />
            <Button
              href="https://www.instagram.com/endo_integral/"
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              @endo_integral <ArrowUpRight size={15} />
            </Button>
          </div>
          <VideoSlot name="contacto_saludo" compact />
        </aside>
      </section>
    </>
  );
}
