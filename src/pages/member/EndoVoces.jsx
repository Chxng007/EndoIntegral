import { useState } from "react";
import { Headphones, Play } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import { Button, EmptyState, Loading, Notice } from "../../components/ui";
import { useRows } from "../../lib/hooks";
import { usePodcast } from "../../components/video/PodcastPlayer";
export default function EndoVoces() {
  const { rows, loading, error } = useRows("podcast_episodes", {
    order: "publicado_at",
  });
  const [filter, setFilter] = useState("todos");
  const { play } = usePodcast();
  const episodes = rows.filter(
    (e) =>
      e.publicado_at &&
      new Date(e.publicado_at) <= new Date() &&
      (filter === "todos" || e.tipo === filter),
  );
  return (
    <>
      <MemberTitle
        eyebrow="VOCES QUE ACOMPAÑAN"
        title="Endo-"
        accent="Voces"
        description="Escúchalo mientras descansas en tus días de fatiga. Historias y conversaciones que te acercan a otras experiencias."
      />
      <div className="chips">
        {[
          ["todos", "Todos"],
          ["especialista", "Especialistas"],
          ["testimonio", "Testimonios"],
        ].map(([v, l]) => (
          <button
            className="chip"
            key={v}
            aria-pressed={filter === v}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : !episodes.length ? (
        <EmptyState
          icon={Headphones}
          title="Muy pronto, nuestra primera conversación"
        >
          Aquí escucharás el primer episodio de Endo-Voces cuando el equipo lo
          publique.
        </EmptyState>
      ) : (
        <div className="two-col">
          {episodes.map((e) => (
            <article key={e.id} className="card">
              <span className="icon-disc rose">
                <Headphones />
              </span>
              <h3 style={{ marginTop: 20 }}>{e.titulo}</h3>
              <p>{e.descripcion}</p>
              <p style={{ fontSize: 11, margin: "18px 0" }}>
                {e.duracion_seg
                  ? `${Math.ceil(e.duracion_seg / 60)} min · `
                  : ""}
                {e.tipo === "especialista" ? "Especialista" : "Testimonio"}
              </p>
              <Button onClick={() => play(e)}>
                <Play size={15} />
                Escuchar episodio
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
