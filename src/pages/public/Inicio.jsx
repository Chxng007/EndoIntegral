import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Camera as Instagram,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import AnatomyViewer from "../../components/three/AnatomyViewer";
import { Badge, Button, SectionTitle } from "../../components/ui";
import Icon from "../../components/ui/Icon";
import Plans from "../../components/ui/Plans";
import { VideoSlot } from "../../components/video/Video";
import content from "../../lib/content/inicio";
import { useAuth } from "../../lib/auth";
import { canAccess, firstName } from "../../lib/plans";
export default function Inicio() {
  const { user, profile } = useAuth();
  // Sin sesión todo aparece con candado; con sesión solo lo que no incluye su plan.
  const open = (id) => Boolean(user) && canAccess(profile, id);
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-main">
            <div className="hero-copy">
              <Badge warm>
                <Sparkles size={12} /> Comunidad y acompañamiento en
                endometriosis
              </Badge>
              <h1>
                No eres una
                <br />
                <em>exagerada.</em>
                <span className="hero-second">
                  Tu dolor merece
                  <br />
                  un cuidado integral.
                </span>
              </h1>
              <p className="hero-description">{content.description}</p>
              <div className="button-row">
                <Button to="/programa" arrow>
                  Conocer el programa
                </Button>
                <Button to="/endometriosis" variant="secondary">
                  Hablemos de endometriosis
                </Button>
              </div>
              <p className="hero-member">
                {user ? (
                  <Link to="/app">
                    Hola, {firstName(profile) || "bienvenida"} — Ir a mi espacio
                  </Link>
                ) : (
                  <>
                    <LockKeyhole size={12} />
                    <Link to="/ingresar">Pertenezco — Entrar</Link>
                  </>
                )}
              </p>
            </div>
            <AnatomyViewer hero />
          </div>
          <div className="hero-bottom">
            <span>
              <Heart size={13} strokeWidth={1.4} /> Un espacio seguro. Un
              cuidado que te escucha.
            </span>
            <a className="hero-scroll" href="#contigo">
              Descubre tu camino <ArrowDown size={12} />
            </a>
            <span>CUERPO · MENTE · BIENESTAR</span>
          </div>
        </div>
      </section>
      <div className="care-strip">
        <div className="container">
          <span>Educación que empodera</span>
          <i>✦</i>
          <span>Acompañamiento que abraza</span>
          <i>✦</i>
          <span>Bienestar a tu ritmo</span>
        </div>
      </div>
      <section id="contigo" className="container section">
        <SectionTitle
          center
          eyebrow="CONTIGO, EN CADA ETAPA"
          title="No tienes que recorrer"
          accent="este camino sola."
          description="Comprender lo que sientes es el primer paso. Estamos aquí para acompañarte en los que siguen."
        />
        <div className="benefit-grid">
          {content.benefits.map((b, i) => {
            const Tag = b.to ? Link : "article";
            const to =
              b.locked && user ? "/app/endo-voces" : b.to;
            return (
              <Tag
                {...(b.to ? { to } : {})}
                className="benefit"
                key={b.title}
              >
                <span
                  className={`icon-disc ${["", "rose", "warm", "green"][i]}`}
                >
                  <Icon name={b.icon} size={23} />
                </span>
                <span className="benefit-arrow">
                  {b.locked && !open("endo-voces") ? (
                    <LockKeyhole size={14} />
                  ) : b.to ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                {b.soon && <span className="tiny-badge">PRÓXIMAMENTE</span>}
              </Tag>
            );
          })}
        </div>
      </section>
      <section className="container section-sm validation">
        <VideoSlot name="inicio_validacion" />
        <div className="validation-copy">
          <p className="eyebrow">TE CREEMOS. TE ESCUCHAMOS.</p>
          <h2>
            Lo que sientes es real.
            <br />
            <em>Y merece atención.</em>
          </h2>
          <p>
            Vivir con dolor puede ser agotador. También lo es tener que
            explicarlo una y otra vez. Aquí tu experiencia tiene un lugar, y tu
            bienestar importa en todas sus dimensiones.
          </p>
          <div className="quote">
            “Tu dolor no te define.
            <br />
            Tu camino de cuidado puede empezar hoy.”
          </div>
          <Link className="text-link" to="/programa">
            Conoce nuestra forma de acompañarte <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="plans-section section" style={{ marginTop: 70 }}>
        <div className="container">
          <div className="section-title-row">
            <SectionTitle
              eyebrow="UN CAMINO PENSADO PARA TI"
              title="Cada historia, un"
              accent="cuidado diferente."
              description="Tres planes para encontrarnos en el momento que estás viviendo."
            />
            <Link className="text-link" to="/programa#planes">
              Explorar los planes <ArrowUpRight size={15} />
            </Link>
          </div>
          <Plans />
        </div>
      </section>
      <section className="member-preview section">
        <div className="container">
          <SectionTitle
            center
            eyebrow="TU ESPACIO, A TU RITMO"
            title="Pequeñas herramientas."
            accent="Un gran acompañamiento."
            description={
              user
                ? `${firstName(profile) || "Hola"}, estas son las herramientas de tu espacio privado. Entra cuando lo necesites.`
                : "Al inscribirte en un plan recibes acceso a tu espacio privado. Un lugar al que volver, incluso en los días difíciles."
            }
          />
          <div className="module-grid">
            {content.modules.map((m) => {
              const available = open(m.id);
              return (
                <Link
                  to={user ? `/app/${m.id}` : "/ingresar"}
                  className={`module-card ${user && !available ? "is-locked" : ""}`}
                  key={m.id}
                  aria-label={
                    available
                      ? undefined
                      : `${m.name} (${user ? "no incluido en tu plan" : "requiere iniciar sesión"})`
                  }
                >
                  <Icon name={m.icon} size={25} />
                  <span className="module-lock">
                    {available ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <LockKeyhole size={12} />
                    )}
                  </span>
                  <h3>{m.name}</h3>
                  <p>{m.text}</p>
                </Link>
              );
            })}
          </div>
          <div className="center">
            <Button to={user ? "/app" : "/ingresar"} variant="secondary" arrow>
              {user ? "Ir a mi espacio" : "Pertenezco — Entrar"}
            </Button>
          </div>
        </div>
      </section>
      <section className="container section-sm">
        <div className="insta-strip">
          <div>
            <Instagram size={32} strokeWidth={1.3} />
            <div>
              <h3>
                También estamos <em>cerquita de ti.</em>
              </h3>
              <p>Reflexiones, educación y compañía en @endo_integral</p>
            </div>
          </div>
          <Button
            href="https://www.instagram.com/endo_integral/"
            target="_blank"
            rel="noreferrer"
            variant="secondary"
          >
            Síguenos en Instagram <ArrowUpRight size={15} />
          </Button>
        </div>
      </section>
    </>
  );
}
