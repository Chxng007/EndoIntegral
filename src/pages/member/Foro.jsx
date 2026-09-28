import { useEffect, useState } from "react";
import { Flag, Heart, MessageCircle, Send, UserRound } from "lucide-react";
import { MemberTitle, UrgentHelp } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Field,
  Modal,
  Notice,
  useToast,
} from "../../components/ui";
import { VideoEmbed } from "../../components/video/Video";
import { useAuth } from "../../lib/auth";
import { supabase, result } from "../../lib/supabase";
import { useRows } from "../../lib/hooks";
import { youtubeId } from "../../lib/videos";
const riskWords = /suicid|matarme|quitarme la vida|hacerme daño/i;
export default function Foro() {
  const { user } = useAuth();
  const { rows, refresh, error } = useRows("forum_posts_public");
  const [norms, setNorms] = useState(false),
    [accepted, setAccepted] = useState(false),
    [help, setHelp] = useState(false),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState("recent");
  const toast = useToast();
  useEffect(() => {
    supabase
      .from("consents")
      .select("id")
      .eq("tipo", "normas_foro")
      .eq("user_id", user.id)
      .eq("version", "1.0")
      .then(({ data }) => setAccepted(Boolean(data?.length)));
    const channel = supabase
      .channel("community-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_posts" },
        refresh,
      )
      .subscribe();
    const timer = setInterval(refresh, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [user.id, refresh]);
  async function publish(e) {
    e.preventDefault();
    if (!accepted) {
      setNorms(true);
      return;
    }
    const el = e.currentTarget,
      f = new FormData(el),
      text = f.get("contenido");
    const url = f.get("youtube");
    if (url && !youtubeId(url)) {
      toast("Usa un enlace de YouTube válido.", "error");
      return;
    }
    setBusy(true);
    try {
      await result(
        supabase.rpc("create_forum_post", {
          body: text,
          anonymous: f.get("anonima") === "on",
          video_id: url ? youtubeId(url) : null,
        }),
      );
      el.reset();
      if (riskWords.test(text)) setHelp(true);
      toast("Tu publicación ya está en la comunidad.");
      refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <MemberTitle
        eyebrow="COMUNIDAD"
        title="No estás sola,"
        accent="estamos contigo"
        description="Un espacio para compartir, preguntar y encontrar compañía en otras experiencias."
      />
      <Notice>
        Lo que se comparte aquí son experiencias personales, no recomendaciones
        médicas. No publiques datos de contacto ni información que identifique a
        otras personas.
      </Notice>
      <button
        className="text-link"
        style={{ background: "none", marginBottom: 20 }}
        onClick={() => setNorms(true)}
      >
        Leer las normas de la comunidad
      </button>
      <form className="form-card forum-compose" onSubmit={publish}>
        <Field label="¿Qué te gustaría compartir?">
          <textarea
            name="contenido"
            required
            minLength={3}
            maxLength={5000}
            placeholder="Este espacio también es tuyo…"
          />
        </Field>
        <Field label="Enlace de YouTube (opcional)">
          <input
            type="url"
            name="youtube"
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </Field>
        <div className="button-row">
          <label className="checkbox-label">
            <input name="anonima" type="checkbox" />
            Publicar como anónima ante la comunidad
          </label>
          <Button disabled={busy} type="submit">
            <Send size={15} />
            {busy ? "Publicando…" : "Publicar"}
          </Button>
        </div>
        <p style={{ fontSize: 10 }}>
          El equipo de moderación puede identificar a la autora cuando sea
          necesario para gestionar reportes.
        </p>
      </form>
      <div className="history-filter">
        <h2>Voces de la comunidad</h2>
        <select
          aria-label="Orden de publicaciones"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ width: 170 }}
        >
          <option value="recent">Más recientes</option>
          <option value="supported">Más apoyadas</option>
        </select>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!rows.length ? (
        <EmptyState
          icon={MessageCircle}
          title="Un espacio que construimos juntas"
        >
          Aún no hay publicaciones. Puedes compartir una reflexión cuando lo
          desees.
        </EmptyState>
      ) : (
        [...rows]
          .sort((a, b) =>
            order === "supported"
              ? b.reacciones - a.reacciones
              : new Date(b.created_at) - new Date(a.created_at),
          )
          .map((p) => <Post key={p.id} post={p} refresh={refresh} />)
      )}
      {norms && (
        <Modal title="Cuidemos este espacio" onClose={() => setNorms(false)}>
          <p>
            Comparte con respeto, sin juicios ni discriminación. No publiques
            datos de otras personas, publicidad ni indicaciones para cambiar
            tratamientos. Habla desde tu experiencia y reporta contenido que te
            preocupe.
          </p>
          <p>
            El equipo puede ocultar publicaciones y revisar reportes. Este
            espacio no ofrece respuesta de urgencias ni vigilancia permanente.
          </p>
          <Button
            onClick={async () => {
              try {
                if (!accepted)
                  await result(
                    supabase.from("consents").insert({
                      user_id: user.id,
                      tipo: "normas_foro",
                      version: "1.0",
                    }),
                  );
                setAccepted(true);
                setNorms(false);
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          >
            {accepted ? "Entendido" : "Acepto las normas"}
          </Button>
        </Modal>
      )}
      {help && <UrgentHelp onClose={() => setHelp(false)} />}
    </>
  );
}
function Post({ post, refresh }) {
  const [expanded, setExpanded] = useState(false),
    [thread, setThread] = useState(false),
    [replies, setReplies] = useState([]),
    [report, setReport] = useState(null),
    [busy, setBusy] = useState(false),
    [help, setHelp] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  async function loadReplies() {
    const { data, error } = await supabase
      .from("forum_replies_public")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at");
    if (error) toast("No pudimos cargar las respuestas.", "error");
    else setReplies(data || []);
  }
  return (
    <article className="forum-post">
      <div className="post-header">
        <span className="post-avatar">
          <UserRound size={19} />
        </span>
        <div>
          <h3>{post.autora || "Anónima"}</h3>
          <small>
            {new Date(post.created_at).toLocaleString("es-CO", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </small>
        </div>
      </div>
      <p className="post-content">
        {expanded || post.contenido.length <= 400
          ? post.contenido
          : post.contenido.slice(0, 400) + "…"}
      </p>
      {post.contenido.length > 400 && (
        <button
          className="text-link"
          style={{ background: "none", fontSize: 11 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
      {post.youtube_id && (
        <div style={{ marginTop: 18 }}>
          <VideoEmbed
            id={post.youtube_id}
            title="Video compartido en la comunidad"
          />
        </div>
      )}
      <div className="post-actions">
        <button
          aria-pressed={post.mi_reaccion}
          onClick={async () => {
            try {
              await result(
                supabase.rpc("toggle_forum_reaction", { target: post.id }),
              );
              refresh();
            } catch (e) {
              toast(e.message, "error");
            }
          }}
        >
          <Heart size={15} fill={post.mi_reaccion ? "currentColor" : "none"} />
          {post.reacciones || 0} apoyos
        </button>
        <button
          onClick={() => {
            if (!thread) loadReplies();
            setThread(!thread);
          }}
        >
          <MessageCircle size={15} />
          Respuestas
        </button>
        <button onClick={() => setReport({ type: "post", id: post.id })}>
          <Flag size={13} />
          Reportar
        </button>
      </div>
      {thread && (
        <div>
          {replies.map((r) => (
            <div className="reply" key={r.id}>
              <h4>{r.autora || "Anónima"}</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.contenido}</p>
              <button
                className="text-link"
                style={{ background: "none", fontSize: 10, marginTop: 8 }}
                onClick={() => setReport({ type: "reply", id: r.id })}
              >
                Reportar respuesta
              </button>
            </div>
          ))}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const el = e.currentTarget,
                f = new FormData(el);
              setBusy(true);
              try {
                await result(
                  supabase.rpc("create_forum_reply", {
                    parent_id: post.id,
                    body: f.get("contenido"),
                    anonymous: f.get("anonima") === "on",
                  }),
                );
                if (riskWords.test(f.get("contenido"))) setHelp(true);
                el.reset();
                loadReplies();
              } catch (e) {
                toast(e.message, "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Tu respuesta">
              <textarea
                name="contenido"
                required
                minLength={2}
                maxLength={3000}
              />
            </Field>
            <label className="checkbox-label">
              <input type="checkbox" name="anonima" />
              Responder de forma anónima
            </label>
            <Button type="submit" disabled={busy} variant="secondary">
              Responder
            </Button>
          </form>
        </div>
      )}
      {help && <UrgentHelp onClose={() => setHelp(false)} />}{" "}
      {report && (
        <Modal title="Reportar contenido" onClose={() => setReport(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await result(
                  supabase.from("forum_reports").insert({
                    target_tipo: report.type,
                    target_id: report.id,
                    user_id: user.id,
                    motivo: f.get("motivo"),
                  }),
                );
                setReport(null);
                toast("Reporte enviado al equipo de moderación.");
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          >
            <Field label="Motivo del reporte">
              <textarea name="motivo" required minLength={5} maxLength={1000} />
            </Field>
            <Button type="submit">Enviar reporte</Button>
          </form>
        </Modal>
      )}
    </article>
  );
}
