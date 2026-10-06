import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardList, Clock3, LockKeyhole } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import { Badge, Button } from "../../components/ui";
import Icon from "../../components/ui/Icon";
import { VideoSlot } from "../../components/video/Video";
import content from "../../lib/content/inicio";
import programa from "../../lib/content/programa";
import { useAuth } from "../../lib/auth";
import { useRows, today } from "../../lib/hooks";
import {
  canAccess,
  firstName,
  hasPlan,
  isAdmin,
  planLabels,
  planModules,
} from "../../lib/plans";
// Cuenta gratuita: aún no tiene módulos; ve los planes y cómo solicitarlos.
function FreeHome({ profile }) {
  return (
    <>
      <MemberTitle
        eyebrow="TU CUENTA GRATUITA"
        title="Te damos la"
        accent="bienvenida"
        description={`${firstName(profile) || "Hola"}, ya tienes tu cuenta. Para abrir las herramientas de tu espacio elige el plan que mejor acompañe tu momento y solicítalo: el equipo te escribirá para coordinar tu inscripción.`}
      />
      <ol className="acquire-steps" style={{ marginTop: 0 }}>
        <li>
          <strong>Elige tu plan</strong>
          Revisa qué incluye cada uno.
        </li>
        <li>
          <strong>Solicítalo</strong>
          Deja tu celular en el formulario.
        </li>
        <li>
          <strong>Te escribimos</strong>
          Coordinamos contigo el pago.
        </li>
        <li>
          <strong>Se activa aquí</strong>
          En esta misma cuenta, con aviso por correo.
        </li>
      </ol>
      <div className="free-plans">
        {programa.plans.map((plan) => (
          <article className="card free-plan" key={plan.id}>
            <Badge>PLAN {plan.number}</Badge>
            <h3>{plan.name}</h3>
            <p className="free-plan-tagline">{plan.tagline}</p>
            <p className="free-plan-meta">
              <Clock3 size={13} /> {plan.weeks} semanas · {plan.price}{" "}
              {plan.priceNote}
            </p>
            <p className="free-plan-modules">
              Abre en tu espacio:{" "}
              {content.modules
                .filter((m) => planModules[plan.id].includes(m.id))
                .map((m) => m.name)
                .join(", ")}
              .
            </p>
            <div className="button-row">
              <Button to={`/contacto?asunto=plan-${plan.id}`} arrow>
                Solicitar este plan
              </Button>
              <Link className="text-link" to="/programa#planes">
                Ver detalles
              </Link>
            </div>
          </article>
        ))}
      </div>
      <h2 style={{ fontSize: 24, margin: "40px 0 16px" }}>
        Lo que encontrarás en tu <em>espacio</em>
      </h2>
      <div className="module-grid">
        {content.modules.map((m) => (
          <div
            className="module-card is-locked"
            key={m.id}
            aria-label={`${m.name} (se activa con un plan)`}
          >
            <Icon name={m.icon} size={25} />
            <span className="module-lock">
              <LockKeyhole size={13} />
            </span>
            <h3>{m.name}</h3>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
export default function MemberHome() {
  const { profile } = useAuth();
  const free = !hasPlan(profile) && !isAdmin(profile);
  const { rows } = useRows("symptom_logs", { order: "fecha" });
  if (free) return <FreeHome profile={profile} />;
  const log = rows.find((r) => r.fecha === today());
  const tracking = canAccess(profile, "sintomas");
  const included = content.modules.filter((m) => canAccess(profile, m.id)),
    others = content.modules.filter((m) => !canAccess(profile, m.id));
  return (
    <>
      <MemberTitle
        title="Tu espacio de"
        accent="bienestar"
        description={`${firstName(profile) || "Hola"}, no hay una forma perfecta de cuidarte. Empieza por lo que necesitas hoy.`}
      />
      {tracking && (
        <div className="quick-card">
          <span className="icon-disc">
            <ClipboardList size={25} />
          </span>
          <div>
            <h3>¿Cómo te sientes hoy?</h3>
            <p>
              {log
                ? `Hoy registraste dolor ${log.dolor}/10. Puedes actualizar tu registro cuando quieras.`
                : "Tómate dos minutos para escuchar a tu cuerpo."}
            </p>
          </div>
          <Button to="/app/sintomas" arrow>
            {log ? "Ver mi registro" : "Registrar mi día"}
          </Button>
        </div>
      )}
      <div className="module-grid">
        {included.map((m) => (
          <Link className="module-card" key={m.id} to={`/app/${m.id}`}>
            <Icon name={m.icon} size={25} />
            <span className="module-lock">
              <ArrowUpRight size={14} />
            </span>
            <h3>{m.name}</h3>
            <p>{m.text}</p>
          </Link>
        ))}
      </div>
      {others.length > 0 && (
        <p className="plan-upsell">
          Tu {planLabels[profile?.plan]} incluye {included.length} de{" "}
          {content.modules.length} espacios.{" "}
          <Link to="/programa#planes">Conoce los otros planes</Link> o{" "}
          <Link to="/contacto?asunto=general">escríbenos</Link> si quieres
          ampliar tu acompañamiento.
        </p>
      )}
      <div style={{ marginTop: 30 }}>
        <VideoSlot name="miembros_bienvenida" compact />
      </div>
    </>
  );
}
