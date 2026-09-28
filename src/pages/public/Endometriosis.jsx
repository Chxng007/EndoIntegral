import { useState } from "react";
import { PageHeader } from "../../components/layout/Layout";
import { Badge, Button, Notice, SectionTitle } from "../../components/ui";
import Icon from "../../components/ui/Icon";
import AnatomyViewer from "../../components/three/AnatomyViewer";
import { VideoSlot } from "../../components/video/Video";
import {
  definition,
  symptoms,
  forms,
  treatments,
  mentalHealthIntro,
  mentalHealth,
  prevention,
  sources,
} from "../../lib/content/endometriosis";
function InfoGrid({ items }) {
  return (
    <div className="symptom-grid">
      {items.map(([icon, title, text]) => (
        <article className="symptom-card" key={title}>
          <Icon name={icon} size={25} />
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
export default function Endometriosis() {
  const [active, setActive] = useState("superficial");
  const form = forms.find((f) => f.id === active);
  return (
    <>
      <PageHeader
        eyebrow="EDUCACIÓN QUE EMPODERA"
        title="Hablemos de"
        accent="endometriosis"
        description="Información clara para comprender tu cuerpo, reconocer tus necesidades y buscar acompañamiento."
      />
      <section className="container section">
        <div className="education-hero">
          <div>
            <Badge>DEFINICIÓN DE ENDOMETRIOSIS</Badge>
            <h2>
              ¿Qué es la
              <br />
              <em>endometriosis?</em>
            </h2>
            <p>{definition}</p>
            <a
              href={sources.who}
              className="source-link"
              target="_blank"
              rel="noreferrer"
            >
              Fuente: Organización Mundial de la Salud ↗
            </a>
          </div>
          <AnatomyViewer scrollDissolve />
        </div>
        <div style={{ marginTop: 50 }}>
          <SectionTitle
            eyebrow="ESCUCHA LAS SEÑALES"
            title="Síntomas más"
            accent="frecuentes."
          />
          <InfoGrid items={symptoms} />
          <div style={{ marginTop: 20 }}>
            <Notice>
              Estos síntomas también pueden tener otras causas. Reconocerlos no
              permite confirmar un diagnóstico: consulta con tu equipo de salud.
            </Notice>
          </div>
        </div>
        <div style={{ marginTop: 65 }}>
          <SectionTitle
            eyebrow="ATENCIÓN CENTRADA EN TI"
            title="Opciones de"
            accent="tratamiento."
            description="El tratamiento se adapta a tus síntomas, tus preferencias y tus proyectos de vida. Se decide junto con profesionales de salud."
          />
          <div className="treatment-grid">
            {treatments.map(([icon, title, text, tone]) => (
              <article className={`treatment-card tone-${tone}`} key={title}>
                <Icon name={icon} size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
                {title === "Apoyo psicológico" && (
                  <Button to="/app/acompanamiento" variant="secondary" arrow>
                    Ver acompañamiento
                  </Button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section-sm">
        <div className="anatomy-explainer">
          <div>
            <p className="eyebrow">EXPLORA Y COMPRENDE</p>
            <h2>
              Tipos de
              <br />
              <em>endometriosis.</em>
            </h2>
            <div
              className="anatomy-tabs"
              role="tablist"
              aria-label="Tipos de endometriosis"
            >
              {forms.map((f, i) => (
                <button
                  key={f.id}
                  id={`tab-${f.id}`}
                  role="tab"
                  aria-selected={active === f.id}
                  aria-controls="anatomy-panel"
                  tabIndex={active === f.id ? 0 : -1}
                  className="tab-button"
                  onClick={() => setActive(f.id)}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const index =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? forms.length - 1
                            : (i +
                                (e.key === "ArrowRight" ? 1 : -1) +
                                forms.length) %
                              forms.length;
                      setActive(forms[index].id);
                      document
                        .getElementById(`tab-${forms[index].id}`)
                        ?.focus();
                    }
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div
              className="tabs-description"
              id="anatomy-panel"
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
            >
              <h3>{form.title}</h3>
              <p>{form.text}</p>
              <p className="model-scene">
                <span />
                {form.scene}
              </p>
            </div>
            <p style={{ fontSize: 10 }}>
              Ilustración educativa simplificada. La intensidad del dolor no
              depende necesariamente del tipo.
            </p>
            <a
              href={sources.eshre}
              className="source-link"
              target="_blank"
              rel="noreferrer"
            >
              Fuente: guía ESHRE ↗
            </a>
          </div>
          <AnatomyViewer mode={active} />
        </div>
      </section>
      <section className="plans-section section">
        <div className="container">
          <SectionTitle
            eyebrow="TAMBIÉN IMPORTA LO QUE SIENTES"
            title="Endometriosis y"
            accent="salud mental."
            description={mentalHealthIntro}
          />
          <h3 className="subsection-title">
            ¿Cómo afecta la endometriosis a la salud mental?
          </h3>
          <div className="impact-grid">
            {mentalHealth.map(([icon, title, text, tone]) => (
              <article className={`impact-card tone-${tone}`} key={title}>
                <Icon name={icon} size={24} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 35 }}>
            <VideoSlot name="endometriosis_mental" compact />
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionTitle
          eyebrow="INFORMACIÓN PARA COLOMBIA"
          title="Tu salud también tiene"
          accent="derechos."
        />
        <div className="legal-accordion">
          <details>
            <summary>Atención integral y entornos laborales saludables</summary>
            <p>
              La Resolución 2068 de 2025 del Ministerio de Salud y Protección
              Social adopta la política pública de endometriosis, en desarrollo
              de la Ley 2338 de 2023. Señala a los empleadores la obligación de
              promover entornos saludables, prevenir actos de discriminación o
              violencia hacia las personas menstruantes y garantizar el
              reconocimiento de incapacidades conforme al Decreto 780 de 2016.
            </p>
            <a
              href={sources.policy}
              className="source-link"
              target="_blank"
              rel="noreferrer"
            >
              Consultar Resolución 2068 de 2025 · Minsalud ↗
            </a>
          </details>
          <details>
            <summary>Horarios flexibles y trabajo en casa</summary>
            <p>
              La Ley 2338 de 2023 establece los lineamientos de la política
              pública para la prevención, el diagnóstico temprano y el
              tratamiento integral de la endometriosis. En materia laboral
              contempla que los empleadores pueden acordar con las personas
              diagnosticadas esquemas de trabajo flexibles o la modalidad de
              trabajo en casa.
            </p>
          </details>
          <details>
            <summary>Permisos para la atención médica</summary>
            <p>
              La Ley 2466 de 2025 contempla permisos remunerados para asistir a
              citas médicas, urgencias o tratamientos relacionados con la
              endometriosis. Estas ausencias no pueden causar sanciones
              disciplinarias, siempre que estén debidamente soportadas.
            </p>
            <a
              href={sources.labor}
              className="source-link"
              target="_blank"
              rel="noreferrer"
            >
              Consultar Ley 2466 de 2025 · Función Pública ↗
            </a>
          </details>
          <details>
            <summary>Lo que ha dicho la Corte Constitucional</summary>
            <p>
              En la Sentencia T-448 de 2023, la Corte reconoció que la
              endometriosis puede afectar la capacidad para desempeñar las
              funciones laborales, y señaló como criterios relevantes el dolor
              crónico, la infertilidad y las afectaciones en los sistemas
              reproductivo y digestivo. También enfatizó la necesidad de un
              enfoque de género y de evitar cualquier discriminación laboral
              asociada al ciclo menstrual o reproductivo.
            </p>
            <p>
              Se trata de una decisión de tutela con efectos entre las partes y
              aún sin una línea jurisprudencial consolidada, por lo que cada
              caso debe valorarse de forma individual.
            </p>
          </details>
        </div>
        <p style={{ fontSize: 11, marginTop: 20 }}>
          Información general basada en el concepto «Consideraciones laborales
          frente a trabajadoras diagnosticadas con endometriosis» (Scola Legal,
          diciembre de 2025); no constituye asesoría legal. Cada situación
          requiere valorar las circunstancias y las normas aplicables.
        </p>
        <div className="prevention" style={{ marginTop: 70 }}>
          <SectionTitle
            eyebrow="NUESTRO COMPROMISO"
            title="Prevención y promoción de la salud mental en"
            accent="EndoIntegral."
          />
          <h3 className="subsection-title">Lo que se va a promover</h3>
          <div className="values-grid">
            {prevention.promote.map(([icon, title, text]) => (
              <article className="value" key={title}>
                <Icon name={icon} size={26} color="#8e6cb3" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="two-col prevention-cols">
            <article className="card accent-rose">
              <h3>Lo que se va a mitigar</h3>
              <p>{prevention.mitigate}</p>
            </article>
            <article className="card accent-lavender">
              <h3>Lo que se va a prevenir</h3>
              <p>{prevention.prevent}</p>
            </article>
          </div>
        </div>
        <div className="cta-panel" style={{ marginTop: 60 }}>
          <h2>¿Te identificas con estos síntomas?</h2>
          <p>
            El plan Orienta te acompaña con educación y herramientas emocionales
            mientras buscas atención profesional.
          </p>
          <Button to="/programa#planes" arrow>
            Conoce el plan Orienta
          </Button>
        </div>
      </section>
    </>
  );
}
