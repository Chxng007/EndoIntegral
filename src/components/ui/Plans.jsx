import { useState } from "react";
import { Clock3, Play } from "lucide-react";
import programa from "../../lib/content/programa";
import { Badge, Button, Modal } from "./index";
import { VideoSlot } from "../video/Video";
export default function Plans({ full = false }) {
  const [video, setVideo] = useState(null);
  return (
    <>
      <div className="plan-grid">
        {programa.plans.map((plan, i) => (
          <article
            className={`plan-card ${i === 0 ? "featured" : ""}`}
            key={plan.id}
          >
            <div className="plan-top">
              <span className="plan-number">0{i + 1}</span>
              <Badge>
                {i === 0
                  ? "Acompañamiento integral"
                  : i === 1
                    ? "Orientación y cuidado"
                    : "Educación y bienestar"}
              </Badge>
            </div>
            <span className="plan-subtitle">EndoIntegral</span>
            <h3>{plan.name}</h3>
            <p>Para {plan.audience}</p>
            <span className="plan-duration">
              <Clock3 size={14} />
              {plan.weeks} semanas · A tu ritmo
            </span>
            {full && (
              <>
                <p className="plan-objective">{plan.objective}</p>
                <details>
                  <summary>Todo lo que incluye tu plan</summary>
                  <ul>
                    {plan.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}
            <Button
              to={
                full ? `/contacto?asunto=plan-${plan.id}` : "/programa#planes"
              }
              variant={i === 0 ? "primary" : "secondary"}
              arrow
            >
              {full ? "Quiero este plan" : "Conocer el plan"}
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
