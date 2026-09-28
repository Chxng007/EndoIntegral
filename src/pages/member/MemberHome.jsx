import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import { Button } from "../../components/ui";
import Icon from "../../components/ui/Icon";
import { VideoSlot } from "../../components/video/Video";
import content from "../../lib/content/inicio";
import { useAuth } from "../../lib/auth";
import { useRows, today } from "../../lib/hooks";
import { canAccess, firstName, planNames } from "../../lib/plans";
export default function MemberHome() {
  const { profile } = useAuth();
  const { rows } = useRows("symptom_logs", { order: "fecha" });
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
          Tu plan {planNames[profile?.plan] || ""} incluye {included.length} de{" "}
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
