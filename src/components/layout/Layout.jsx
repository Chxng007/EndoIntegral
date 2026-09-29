import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Camera as Instagram,
  LayoutGrid,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { firstName } from "../../lib/plans";
import { Button, Loading } from "../ui";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="EndoIntegral, inicio">
      <img src="/img/logo-circular.jpeg" alt="" width="52" height="52" />
      <span>
        <strong>
          Endo<em>Integral</em>
        </strong>
        <small>CUERPO, MENTE Y BIENESTAR</small>
      </span>
    </Link>
  );
}
const links = [
  ["/", "Inicio"],
  ["/endometriosis", "Hablemos de endometriosis"],
  ["/programa", "Programa"],
  ["/contacto", "Contáctanos"],
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  // Con sesión iniciada: «Mi espacio» en el menú y el nombre de la persona lleva a su cuenta.
  const accountLabel = user
    ? firstName(profile) ||
      firstName({ nombre: user.user_metadata?.nombre }) ||
      "Mi cuenta"
    : "Mi cuenta";
  const accountTo = user ? "/app/cuenta" : "/ingresar";
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Brand />
        <nav
          className={open ? "nav-links is-open" : "nav-links"}
          aria-label="Navegación principal"
          id="main-nav"
        >
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `nav-space ${isActive && !pathname.startsWith("/app/cuenta") ? "active" : ""}`
              }
            >
              <LayoutGrid size={15} aria-hidden="true" />
              Mi espacio
            </NavLink>
          )}
          <div className="mobile-nav-actions">
            <Button to={accountTo} variant="secondary">
              <UserRound size={15} aria-hidden="true" />
              {accountLabel}
            </Button>
            <Button to="/contacto">
              Hablemos <ArrowUpRight size={17} />
            </Button>
          </div>
        </nav>
        <div className="nav-actions">
          <Link
            to={accountTo}
            className={`account-link ${user ? "is-signed" : ""}`}
            aria-label={user ? `Mi cuenta (${accountLabel})` : "Mi cuenta"}
            title={user ? "Configurar mi cuenta" : undefined}
          >
            {user ? (
              <span className="account-avatar" aria-hidden="true">
                {accountLabel[0]?.toUpperCase()}
              </span>
            ) : (
              <UserRound size={17} aria-hidden="true" />
            )}
            <span className="account-name">{accountLabel}</span>
          </Link>
          <Button to="/contacto">
            Hablemos <ArrowUpRight size={17} />
          </Button>
        </div>
        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="main-nav"
          className="menu-toggle icon-button"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  const { user } = useAuth();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand />
          <p>
            Un camino de cuidado.
            <br />
            Un espacio para sentirte acompañada.
          </p>
          <a
            className="social-link"
            href="https://www.instagram.com/endo_integral/"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} />
            @endo_integral <ArrowUpRight size={15} />
          </a>
        </div>
        <div>
          <h3>Conoce EndoIntegral</h3>
          {links.map(([to, label]) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Tu bienestar</h3>
          <Link to={user ? "/app" : "/ingresar"}>{user ? "Mi espacio" : "Yo soy miembra"}</Link>
          <Link to="/programa#planes">Encuentra tu plan</Link>
          <Link to="/privacidad">Tratamiento de datos</Link>
        </div>
        <div className="footer-note">
          <Heart size={27} strokeWidth={1.2} />
          <p>
            Tu experiencia importa.
            <br />
            Tu dolor merece ser escuchado.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} EndoIntegral</span>
        <span>
          Este sitio es educativo y no reemplaza la consulta médica ni la
          atención de urgencias.
        </span>
      </div>
    </footer>
  );
}
export function PageHeader({ eyebrow, title, accent, description }) {
  return (
    <section className="page-header">
      <div className="container">
        <Link to="/" className="back-link">
          ← Volver al inicio
        </Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title} <em>{accent}</em>
        </h1>
        {description && <p className="page-description">{description}</p>}
      </div>
    </section>
  );
}
export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        {/* La carga de cada página ocurre aquí dentro: navbar y footer no desaparecen. */}
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
