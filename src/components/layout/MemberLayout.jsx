import { Suspense, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  FileText,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Mic,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import content from "../../lib/content/inicio";
import {
  adminSections,
  canAccess,
  firstName,
  isAdmin,
  planNames,
  plansWith,
} from "../../lib/plans";
import Icon from "../ui/Icon";
import { Badge, Button, EmptyState, Loading, Modal } from "../ui";
import { PodcastProvider, PersistentPlayer } from "../video/PodcastPlayer";
export function UrgentHelp({ onClose }) {
  return (
    <Modal
      title="Busca acompañamiento ahora"
      eyebrow="ESTAMOS CONTIGO"
      onClose={onClose}
    >
      <p>
        Si estás en peligro inmediato o necesitas atención urgente, comunícate
        con emergencias o acude al servicio de urgencias más cercano.
      </p>
      <Button href="tel:123">Llamar al 123 · Colombia</Button>
      <p>
        También puedes contactar a alguien de confianza para que te acompañe.
        Este foro y los formularios no se revisan de forma inmediata.
      </p>
    </Modal>
  );
}
export function MemberTitle({
  eyebrow = "TU ESPACIO DE BIENESTAR",
  title,
  accent,
  description,
}) {
  return (
    <div className="member-title">
      <Badge>{eyebrow}</Badge>
      <h1>
        {title} <em>{accent}</em>
      </h1>
      {description && <p>{description}</p>}
    </div>
  );
}
function PlanLocked({ module, profile }) {
  return (
    <>
      <MemberTitle
        eyebrow="NO INCLUIDO EN TU PLAN"
        title={module.name}
        accent=""
      />
      <EmptyState
        icon={LockKeyhole}
        title={`Este espacio no está incluido en el plan ${planNames[profile.plan] || profile.plan}`}
      >
        Está disponible en el plan {plansWith(module.id).join(" y ")}. Si
        quieres ampliar tu acompañamiento, escríbenos y te orientamos.
      </EmptyState>
      <div className="center" style={{ marginTop: 25 }}>
        <Button to="/contacto?asunto=general" arrow>
          Hablar con el equipo
        </Button>
      </div>
    </>
  );
}
const adminIcons = {
  "": LayoutDashboard,
  miembras: Users,
  mensajes: Mail,
  solicitudes: CalendarCheck,
  podcasts: Mic,
  profesionales: Stethoscope,
  recursos: FileText,
  videos: Video,
  foro: ShieldAlert,
};
function SidebarNav({ profile, signOut }) {
  const admin = isAdmin(profile);
  const ref = useRef(null);
  const { pathname } = useLocation();
  // En el celular la barra se desliza de lado: centra la sección activa para que siempre se vea.
  useEffect(() => {
    const nav = ref.current,
      active = nav?.querySelector("a.active");
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const n = nav.getBoundingClientRect(),
      a = active.getBoundingClientRect();
    nav.scrollTo({
      left: nav.scrollLeft + a.left - n.left - (n.width - a.width) / 2,
    });
  }, [pathname]);
  // Las usuarias solo ven los módulos de su plan; el equipo los ve todos.
  const modules = content.modules.filter((m) => canAccess(profile, m.id));
  const hidden = content.modules.length - modules.length;
  return (
    <nav aria-label="Tu espacio privado" ref={ref}>
      {admin && <p className="nav-group-label">Mi espacio</p>}
      <NavLink to="/app" end>
        <Home size={17} />
        Inicio
      </NavLink>
      {modules.map((m) => (
        <NavLink key={m.id} to={`/app/${m.id}`}>
          <Icon name={m.icon} />
          {m.name}
        </NavLink>
      ))}
      {admin && (
        <>
          <p className="nav-group-label">Panel del equipo</p>
          {adminSections.map(([path, label]) => {
            const I = adminIcons[path];
            return (
              <NavLink
                key={path}
                to={`/admin${path ? "/" + path : ""}`}
                end={!path}
              >
                <I size={17} />
                {label}
              </NavLink>
            );
          })}
        </>
      )}
      {admin && <p className="nav-group-label">Cuenta</p>}
      <NavLink to="/app/cuenta">
        <UserRound size={17} />
        Mi cuenta
      </NavLink>
      {hidden > 0 && (
        <NavLink to="/programa#planes" className="nav-upgrade">
          <Sparkles size={17} />
          Ampliar mi plan
        </NavLink>
      )}
      <button onClick={signOut}>
        <LogOut size={17} />
        Cerrar sesión
      </button>
    </nav>
  );
}
export default function MemberLayout() {
  const { profile, signOut } = useAuth();
  const [help, setHelp] = useState(false);
  const { pathname } = useLocation();
  const [area, section] = pathname.split("/").slice(1);
  const current =
    area === "app" && content.modules.find((m) => section === m.id);
  const locked = current && !canAccess(profile, current.id);
  const admin = isAdmin(profile);
  return (
    <PodcastProvider>
      <div className="member-shell">
        <aside className="member-sidebar">
          <div className="member-greeting">
            <span className="icon-disc">
              <Icon name="Flower2" size={25} />
            </span>
            <h3>Hola, {firstName(profile) || "bienvenida"}</h3>
            <p>
              {admin
                ? "Administradora · Equipo EndoIntegral"
                : `Plan ${planNames[profile?.plan] || "EndoIntegral"}`}
            </p>
          </div>
          <SidebarNav profile={profile} signOut={signOut} />
        </aside>
        <div className="member-content">
          {locked ? (
            <PlanLocked module={current} profile={profile} />
          ) : (
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          )}
          <PersistentPlayer />
        </div>
      </div>
      <button className="urgent-button" onClick={() => setHelp(true)}>
        <Icon name="Heart" size={15} />
        Necesito ayuda ahora
      </button>
      {help && <UrgentHelp onClose={() => setHelp(false)} />}
    </PodcastProvider>
  );
}
