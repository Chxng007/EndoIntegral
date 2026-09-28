import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Flower2,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Wind,
} from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Loading,
  Notice,
  SectionTitle,
} from "../../components/ui";
import { VideoEmbed, VideoSlot } from "../../components/video/Video";
import { poses } from "../../lib/content/recursos";
import { mindfulnessVideos, videos, yogaVideos } from "../../lib/videos";
import { supabase } from "../../lib/supabase";
export function ResourceDocument({ category, title }) {
  const [resource, setResource] = useState(null),
    [url, setUrl] = useState(""),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase) {
        setLoaded(true);
        return;
      }
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("categoria", category)
        .order("orden")
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        setError("No pudimos cargar el documento. Intenta de nuevo.");
        setLoaded(true);
        return;
      }
      setResource(data);
      if (data?.pdf_path) {
        const { data: s, error } = await supabase.storage
          .from("resources")
          .createSignedUrl(data.pdf_path, 900);
        if (!alive) return;
        if (error) setError("No pudimos abrir el archivo.");
        else setUrl(s.signedUrl);
      }
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, [category]);
  if (!loaded) return <Loading />;
  if (error) return <Notice tone="error">{error}</Notice>;
  return url ? (
    <>
      <p>{resource.descripcion}</p>
      <iframe className="pdf-frame" src={url} title={title} />
      <Button href={url} target="_blank" rel="noreferrer">
        <Download size={15} />
        Abrir y descargar {title.toLowerCase()}
      </Button>
      <p style={{ fontSize: 10, marginTop: 12 }}>
        El enlace caduca después de 15 minutos. Recarga la página para obtener
        uno nuevo.
      </p>
    </>
  ) : (
    <EmptyState icon={BookOpen} title={`${title}, próximamente`}>
      El equipo está preparando este material. Lo encontrarás aquí cuando esté
      disponible.
    </EmptyState>
  );
}
export default function Recursos() {
  return (
    <>
      <MemberTitle
        title="Recursos para tu"
        accent="bienestar"
        description="Pequeñas pausas para respirar, moverte y volver a ti."
      />
      <div className="resource-index">
        <Link to="/app/recursos/yoga" className="card">
          <Flower2 size={32} />
          <h3>Yoga terapia</h3>
          <p>
            Movimiento, respiración y descanso. Explora ocho posturas y videos
            de acompañamiento.
          </p>
          <span className="text-link">
            Encontrar mi movimiento <ArrowRight size={15} />
          </span>
        </Link>
        <Link to="/app/recursos/mindfulness" className="card">
          <Wind size={32} />
          <h3>Mindfulness</h3>
          <p>
            Un espacio para conectar con el presente y regalarte unos minutos de
            calma.
          </p>
          <span className="text-link">
            Hacer una pausa <ArrowRight size={15} />
          </span>
        </Link>
      </div>
      <SectionTitle
        eyebrow="PARA EMPEZAR HOY"
        title="Un video para"
        accent="acompañarte."
      />
      <div className="video-grid">
        <VideoEmbed {...videos.yoga1} />
        <VideoEmbed {...videos.calma} />
      </div>
      <p style={{ fontSize: 12, marginTop: 16 }}>
        Encuentra los {yogaVideos.filter((k) => videos[k].kind === "yoga").length}{" "}
        videos de yoga en <Link to="/app/recursos/yoga">Yoga terapia</Link> y las{" "}
        {mindfulnessVideos.length} meditaciones guiadas en{" "}
        <Link to="/app/recursos/mindfulness">Mindfulness</Link>.
      </p>
    </>
  );
}
function softBell() {
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return;
    const a = new A(),
      o = a.createOscillator(),
      g = a.createGain();
    o.type = "sine";
    o.frequency.value = 523.25;
    g.gain.setValueAtTime(0.03, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.7);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.7);
    o.onended = () => a.close();
  } catch {
    /* Audio is optional. */
  }
}
export function BackToResources() {
  return (
    <Link to="/app/recursos" className="back-link">
      <ArrowLeft size={15} aria-hidden="true" /> Volver a Recursos
    </Link>
  );
}
export function Yoga() {
  const [step, setStep] = useState(0),
    [remaining, setRemaining] = useState(poses[0].seconds),
    [running, setRunning] = useState(false),
    [complete, setComplete] = useState(false);
  useEffect(() => {
    if (!running) return;
    const end = Date.now() + remaining * 1000;
    const interval = setInterval(() => {
      const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        softBell();
        if (step < poses.length - 1) {
          setStep((s) => s + 1);
          setRemaining(poses[step + 1].seconds);
          setRunning(true);
        } else setComplete(true);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [running, step]);
  function reset() {
    setRunning(false);
    setStep(0);
    setRemaining(poses[0].seconds);
    setComplete(false);
  }
  return (
    <>
      <BackToResources />
      <MemberTitle
        eyebrow="MOVIMIENTO · RESPIRACIÓN · BIENESTAR"
        title="Yoga terapia para la"
        accent="endometriosis"
        description="Tu cuerpo también merece calma. Elige movimientos que se sientan cómodos para ti."
      />
      <div className="resource-hero">
        <p>Relajación · Movilidad · Conexión corporal · Descanso</p>
        <Button
          href="/pdf/yoga-terapia-endometriosis.pdf"
          download
          variant="secondary"
        >
          <Download size={15} />
          Descargar guía de posturas
        </Button>
      </div>
      <Notice>
        Consulta con tu médica antes de iniciar si estás en una crisis de dolor
        o en posoperatorio. Adapta o evita las posturas que te causen molestias.
        La práctica es opcional y puedes detenerte en cualquier momento.
      </Notice>
      <div className="yoga-grid">
        {poses.map((p, i) => (
          <article className="yoga-pose" key={p.name}>
            <img
              className="pose-image"
              src={`/img/poses/postura-${i + 1}.webp`}
              alt={`Ilustración: ${p.name}`}
              width="464"
              height="380"
              loading="lazy"
            />
            <div className="pose-copy">
              <span className="pose-number">POSTURA 0{i + 1}</span>
              <h3>{p.name}</h3>
              <p className="sanskrit">{p.sanskrit}</p>
              <p>{p.text}</p>
              <span className="pose-time">
                <Timer size={12} />
                {p.time}
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="practice-panel">
        <p className="eyebrow">PRACTICAR CONMIGO</p>
        <h2>
          {complete ? "Gracias por regalarte esta pausa." : poses[step].name}
        </h2>
        <p>
          {complete
            ? "Puedes volver cuando lo necesites."
            : `Postura ${step + 1} de 8 · ${poses[step].sanskrit}`}
        </p>
        <div className="timer-display" aria-live="off">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </div>
        <div className="button-row">
          <Button onClick={() => setRunning(!running)} disabled={complete}>
            {running ? <Pause size={15} /> : <Play size={15} />}{" "}
            {running ? "Pausar" : "Comenzar / continuar"}
          </Button>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw size={15} />
            Reiniciar
          </Button>
          {step < 7 && !complete && (
            <Button
              variant="plain"
              onClick={() => {
                setRunning(false);
                setStep(step + 1);
                setRemaining(poses[step + 1].seconds);
              }}
            >
              Siguiente postura →
            </Button>
          )}
        </div>
      </div>
      <SectionTitle
        eyebrow="VIDEOS DE YOGA PARA ENDOMETRIOSIS"
        title="Muévete con"
        accent="acompañamiento."
      />
      <div className="video-grid">
        {yogaVideos
          .filter((key) => videos[key].kind === "yoga")
          .map((key) => (
            <VideoEmbed key={key} {...videos[key]} />
          ))}
      </div>
      <SectionTitle
        eyebrow="PARA CERRAR TU PRÁCTICA"
        title="Respira y"
        accent="descansa."
      />
      <div className="video-grid">
        {yogaVideos
          .filter((key) => videos[key].kind !== "yoga")
          .map((key) => (
            <VideoEmbed key={key} {...videos[key]} />
          ))}
      </div>
      <p
        className="center"
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 24,
          marginTop: 40,
        }}
      >
        Tu bienestar también es parte del tratamiento.
      </p>
    </>
  );
}
export function Mindfulness() {
  const [elapsed, setElapsed] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const start = Date.now() - elapsed * 1000;
    const timer = setInterval(() => {
      const value = Math.min(180, Math.floor((Date.now() - start) / 1000));
      setElapsed(value);
      if (value === 180) setRunning(false);
    }, 200);
    return () => clearInterval(timer);
  }, [running]);
  const cycle = elapsed % 14,
    phase = cycle < 4 ? "Inhala" : cycle < 8 ? "Sostén suavemente" : "Exhala",
    count = cycle < 4 ? 4 - cycle : cycle < 8 ? 8 - cycle : 14 - cycle;
  return (
    <>
      <BackToResources />
      <MemberTitle
        eyebrow="RESPIRA · CONECTA · PRESENTE"
        title="Meditaciones mindfulness"
        accent="guiadas"
        description="Un espacio para respirar, conectar con el presente y regalarte unos minutos de calma."
      />
      <div className="resource-hero">
        <p>Elige tu propia pausa. No necesitas hacerlo perfecto.</p>
        <Button
          href="/pdf/meditaciones-mindfulness.pdf"
          download
          variant="secondary"
        >
          <Download size={15} />
          Descargar guía
        </Button>
      </div>
      <div className="practice-panel">
        <p className="eyebrow">TRES MINUTOS PARA TI</p>
        <h2>
          Volver a tu <em>respiración.</em>
        </h2>
        <p>Inhala 4 segundos · Sostén 4 · Exhala 6</p>
        <div
          className={`breathing-circle ${running && cycle < 8 ? "expanded" : ""}`}
        >
          <strong>
            {elapsed === 180 ? "Gracias." : running ? phase : "A tu ritmo"}
          </strong>
          <span>
            {running
              ? `${count} s`
              : elapsed === 180
                ? "Tu pausa está completa"
                : "Respira con comodidad"}
          </span>
        </div>
        <p role="status">
          {elapsed === 180
            ? "Has completado tu pausa."
            : `${Math.floor((180 - elapsed) / 60)}:${String((180 - elapsed) % 60).padStart(2, "0")} restantes`}
        </p>
        <div className="button-row" style={{ marginTop: 20 }}>
          <Button
            disabled={elapsed === 180}
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={15} /> : <Play size={15} />}{" "}
            {running ? "Pausar" : "Comenzar / continuar"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
          >
            <RotateCcw size={15} />
            Reiniciar
          </Button>
        </div>
        <p style={{ fontSize: 11, marginTop: 20 }}>
          Si sostener el aire te incomoda, respira normalmente. Detente si
          sientes mareo.
        </p>
      </div>
      <SectionTitle title="Una voz que" accent="te acompaña." />
      <div className="video-grid">
        {mindfulnessVideos.map((key) => (
          <VideoEmbed key={key} {...videos[key]} />
        ))}
      </div>
    </>
  );
}
export function Cartilla() {
  return (
    <>
      <MemberTitle
        title="Aprender también es"
        accent="cuidarte"
        description="Tu cartilla psicoeducativa, un recurso para acompañar el programa."
      />
      <ResourceDocument category="cartilla" title="Cartilla psicoeducativa" />
      <div style={{ marginTop: 30 }}>
        <VideoSlot name="cartilla_tutorial" compact />
      </div>
    </>
  );
}
