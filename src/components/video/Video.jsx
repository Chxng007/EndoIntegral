import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useReducedMotion } from "../../lib/hooks";
import { siteVideoSlots } from "../../lib/videos";
export function VideoEmbed({ id, title, channel, kind }) {
  const [playing, setPlaying] = useState(false);
  const label = kind === "meditacion" ? "REPRODUCIR MEDITACIÓN" : "REPRODUCIR VIDEO";
  return (
    <article className="video-card">
      <div className="video-screen">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            className="video-facade has-thumb"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`,
            }}
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir ${title}`}
          >
            <span className="play-disc">
              <Play size={24} fill="currentColor" />
            </span>
            <small>{label}</small>
          </button>
        )}
      </div>
      <div className="video-caption">
        <h3>{title}</h3>
        {channel && <p>{channel}</p>}
        <a
          className="video-link"
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noreferrer"
        >
          Abrir en YouTube <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}
export function VideoSlot({ name, title, compact = false }) {
  const [video, setVideo] = useState(null);
  useEffect(() => {
    let alive = true;
    if (supabase)
      supabase
        .from("site_videos")
        .select("youtube_id,storage_path,poster_url")
        .eq("clave", name)
        .maybeSingle()
        .then(({ data }) => {
          if (alive) setVideo(data);
        });
    return () => {
      alive = false;
    };
  }, [name]);
  const label = title || siteVideoSlots[name] || "Un mensaje del equipo";
  if (video?.youtube_id)
    return <VideoEmbed id={video.youtube_id} title={label} />;
  if (video?.storage_path)
    return (
      <video
        className="owned-video"
        controls
        preload="metadata"
        src={
          supabase.storage
            .from("public-assets")
            .getPublicUrl(video.storage_path).data.publicUrl
        }
        poster={video.poster_url || undefined}
        aria-label={label}
      />
    );
  return (
    <div className={`video-slot ${compact ? "compact" : ""}`}>
      <img src="/img/logo-circular.jpeg" alt="" width="80" height="80" />
      <span className="eyebrow">UN MOMENTO PARA TI</span>
      <h3>{label}</h3>
      <span className="video-soon">
        <Play size={13} /> Video próximamente
      </span>
    </div>
  );
}
export function AmbientVideo({ webm, mp4, poster }) {
  const ref = useRef();
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduced) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden="true"
      className="ambient-video"
    >
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
