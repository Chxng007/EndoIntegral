import { useState } from "react";
import { Clock3, Play, Stethoscope } from "lucide-react";
import programa from "../../lib/content/programa";
import { Badge, Button, Modal } from "./index";
import { VideoSlot } from "../video/Video";
export default function Plans({ full = false }) {
  const [video, setVideo] = useState(null);
  return (
    <>
      <div className="plan-grid">
        {programa.plans.map((plan) => (
          <article
            className={`plan-card ${plan.id === "orienta" ? "featured" : ""}`}
            key={plan.id}
          >
            <div className="plan-top">
              <span className="plan-number">PLAN {plan.number}</span>
              <Badge>{plan.tagline}</Badge>
            </div>
            <span className="plan-subtitle">EndoIntegral</span>
            <h3>{plan.name}</h3>
            <p>Para {plan.audience}</p>
            <span className="plan-duration">
              <Clock3 size={14} />
              {plan.weeks} semanas
            </span>
            <p className="plan-price">
              <strong>{plan.price}</strong> <span>{plan.priceNote}</span>
            </p>
            {full && (
              <>
                <p className="plan-objective">{plan.objective}</p>
                <p className="plan-lead">
                  <Stethoscope size={14} /> {plan.lead}
                </p>
                <details>
                  <summary>Todo lo que incluye tu plan</summary>
                  <ul>
                    {plan.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
                {plan.team.length > 0 && (
                  <details>
                    <summary>Tu equipo interdisciplinario</summary>
                    <ul>
                      {plan.team.map(([role, text]) => (
                        <li key={role}>
                          <strong>{role}:</strong> {text}
                        </li>
                      ))}
                    </ul>
                    {plan.note && <p className="plan-note">{plan.note}</p>}
                  </details>
                )}
                {plan.schedule.length > 0 && (
                  <details>
                    <summary>
                      {plan.id === "diagnostico"
                        ? "Las 10 sesiones de tu proceso"
                        : `Cronograma de ${plan.weeks} semanas`}
                    </summary>
                    <ol>
                      {plan.schedule.map(([title, text]) => (
                        <li key={title}>
                          <strong>{title}.</strong> {text}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                <p className="plan-route">
                  <span>Tu ruta:</span> {plan.route.join(" → ")}
                </p>
              </>
            )}
            <Button
              to={
                full ? `/contacto?asunto=plan-${plan.id}` : "/programa#planes"
              }
              variant={plan.id === "orienta" ? "primary" : "secondary"}
              arrow
            >
              {full ? "Solicitar este plan" : "Conocer el plan"}
            </Button>
            {full && (
              <button className="plan-video" onClick={() => setVideo(plan.id)}>
                <Play size={13} /> Ver video del plan
              </button>
            )}
          </article>
        ))}
      </div>
      {video && (
        <Modal title="Conoce tu plan" onClose={() => setVideo(null)}>
          <VideoSlot name={`plan_${video}`} />
        </Modal>
      )}
    </>
  );
}
