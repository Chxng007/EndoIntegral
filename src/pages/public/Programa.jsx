import {
  HeartHandshake,
  ScanHeart,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  Eye,
} from "lucide-react";
import { PageHeader } from "../../components/layout/Layout";
import { Button, Notice, SectionTitle } from "../../components/ui";
import Plans from "../../components/ui/Plans";
import { VideoSlot } from "../../components/video/Video";
import content from "../../lib/content/programa";
const icons = [
  HeartHandshake,
  ScanHeart,
  UsersRound,
  ShieldCheck,
  Sparkles,
  UsersRound,
];
export default function Programa() {
  return (
    <>
      <PageHeader
        eyebrow="QUIÉNES SOMOS"
        title="Conocer el"
        accent="programa"
        description="Un cuidado que conecta tu cuerpo, tu mente y tu vida cotidiana."
      />
      <section className="container section">
        <div className="two-col about-intro">
          <div className="prose">
            <p className="eyebrow">UNA MIRADA INTEGRAL</p>
            <h2>
              Sobre <em>nosotros.</em>
            </h2>
            <p>{content.about}</p>
          </div>
          <VideoSlot name="programa_institucional" />
        </div>
        <div style={{ marginTop: 45 }} className="notice">
          <div>
            <h3 style={{ fontSize: 25, marginBottom: 15 }}>
              Por qué nace EndoIntegral
            </h3>
            {content.reason.split("\n\n").map((p, i) => (
              <p key={i} style={{ marginBottom: 14 }}>
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="two-col" style={{ marginTop: 40 }}>
          <article className="card accent-rose">
            <Target size={25} color="#af769b" />
            <h3 style={{ marginTop: 20 }}>Nuestra misión</h3>
            <p>{content.mission}</p>
          </article>
          <article className="card accent-lavender">
            <Eye size={25} color="#9470ad" />
            <h3 style={{ marginTop: 20 }}>Nuestra visión</h3>
            <p>{content.vision}</p>
          </article>
        </div>
        <div style={{ marginTop: 65 }}>
          <SectionTitle
            eyebrow="LO QUE NOS GUÍA"
            title="Cuidar también es"
            accent="cómo lo hacemos."
          />
          <div className="values-grid">
            {content.values.map((v, i) => {
              const Icon = icons[i];
              return (
                <article className="value" key={v.name}>
                  <Icon size={23} strokeWidth={1.4} color="#a57bab" />
                  <h3>{v.name}</h3>
                  <p>{v.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section id="planes" className="plans-section section">
        <div className="container">
          <SectionTitle
            center
            eyebrow="ENCUENTRA TU CAMINO"
            title="Un plan para tu"
            accent="momento de vida."
            description="Tres planes que comparten un mismo núcleo: atención clínica, salud mental, psicoeducación, regulación emocional y autocuidado. Cambian la intensidad, la personalización y la duración según tu momento."
          />
          <Plans full />
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Resumen de los tres planes"
          >
            <table className="comparison">
              <caption className="sr-only">
                Resumen de los planes EndoIntegral
              </caption>
              <thead>
                <tr>
                  <th>Resumen</th>
                  {content.plans.map((p) => (
                    <th key={p.id}>
                      Plan {p.number} · {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Población principal",
                    "Mujeres y comunidad interesada en conocer sobre endometriosis",
                    "Mujeres con síntomas o sospecha sin diagnóstico confirmado",
                    "Mujeres con diagnóstico confirmado de endometriosis",
                  ],
                  [
                    "Propósito central",
                    "Psicoeducar, sensibilizar, promover autocuidado y orientar",
                    "Detectar, evaluar, diagnosticar y orientar la ruta clínica e interdisciplinaria",
                    "Acompañar el tratamiento y priorizar el bienestar psicológico y la calidad de vida",
                  ],
                  ["Eje predominante", ...content.plans.map((p) => p.lead)],
                  [
                    "Duración",
                    ...content.plans.map((p) => `${p.weeks} semanas`),
                  ],
                  [
                    "Aporte",
                    ...content.plans.map((p) => `${p.price} ${p.priceNote}`),
                  ],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SectionTitle
            eyebrow="CÓMO ADQUIRIR TU PLAN"
            title="Cuatro pasos para"
            accent="empezar."
          />
          <ol className="acquire-steps">
            <li>
              <strong>Crea tu cuenta gratis</strong>
              Regístrate en «Mi cuenta». Así conoces tu espacio aunque todavía
              no tengas un plan.
            </li>
            <li>
              <strong>Solicita tu plan</strong>
              Elige el plan y envía la solicitud con tu celular. Llega
              directamente al equipo.
            </li>
            <li>
              <strong>Te escribimos</strong>
              Una persona del equipo te contacta para resolver tus dudas y
              coordinar el pago.
            </li>
            <li>
              <strong>Activamos tu plan</strong>
              Con el pago confirmado activamos tu plan en tu misma cuenta y te
              avisamos por correo.
            </li>
          </ol>
          <div className="center" style={{ marginBottom: 30 }}>
            <Button to="/ingresar?modo=registro" variant="secondary" arrow>
              Crear mi cuenta gratis
            </Button>
          </div>
          <Notice>
            Los programas acompañan tu bienestar y se coordinan con el equipo
            interdisciplinario. Las ayudas diagnósticas externas (ecografías,
            mapeos, resonancias) se gestionan con tu EPS o la red aliada y no
            están incluidas en el aporte.
          </Notice>
        </div>
      </section>
      <section className="container section">
        <div className="cta-panel">
          <h2>
            No necesitas tener todas las respuestas
            <br />
            <em>para dar el primer paso.</em>
          </h2>
          <p>
            Cuéntanos tu situación y te ayudamos a encontrar un punto de
            partida.
          </p>
          <Button to="/contacto" arrow>
            Conversemos
          </Button>
        </div>
      </section>
    </>
  );
}
