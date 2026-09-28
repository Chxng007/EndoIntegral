import { createContext, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase, result } from "../../lib/supabase";
import { useToast } from "../ui";
import { VideoEmbed } from "./Video";
const PodcastContext = createContext(null);
export function PodcastProvider({ children }) {
  const [episode, setEpisode] = useState(null),
    [url, setUrl] = useState(""),
    [position, setPosition] = useState(0);
  const toast = useToast();
  const { user } = useAuth();
  async function play(item) {
    try {
      let signed = "";
      if (item.media_tipo !== "youtube") {
        const data = await result(
          supabase.storage
            .from("podcasts")
            .createSignedUrl(item.storage_path, 3600),
        );
        signed = data.signedUrl;
      }
      const { data } = await supabase
        .from("podcast_progress")
        .select("posicion_seg")
        .eq("user_id", user.id)
        .eq("episode_id", item.id)
        .maybeSingle();
      setPosition(data?.posicion_seg || 0);
      setUrl(signed);
      setEpisode(item);
    } catch (e) {
      toast("No pudimos abrir el episodio. Intenta nuevamente.", "error");
    }
  }
  return (
    <PodcastContext.Provider
      value={{ episode, url, position, play, close: () => setEpisode(null) }}
    >
      {children}
    </PodcastContext.Provider>
  );
}
export const usePodcast = () => useContext(PodcastContext);
export function PersistentPlayer() {
  const { episode, url, position, close } = usePodcast();
  const ref = useRef(),
    last = useRef(0);
  const { user } = useAuth();
  async function save() {
    const el = ref.current;
    if (!el || !episode || !user) return;
    await supabase.from("podcast_progress").upsert(
      {
        user_id: user.id,
        episode_id: episode.id,
        posicion_seg: Math.floor(el.currentTime),
        completado: el.ended,
      },
      { onConflict: "user_id,episode_id" },
    );
  }
  useEffect(() => {
    last.current = 0;
  }, [episode?.id]);
  if (!episode) return null;
  const Media = episode.media_tipo === "video" ? "video" : "audio";
  return (
    <div className="podcast-player">
      <div className="button-row" style={{ justifyContent: "space-between" }}>
        <h3>{episode.titulo}</h3>
        <button
          className="icon-button"
          aria-label="Cerrar reproductor"
          onClick={() => {
            save();
            close();
          }}
        >
          <X size={18} />
        </button>
      </div>
      {episode.media_tipo === "youtube" ? (
        <VideoEmbed id={episode.youtube_id} title={episode.titulo} />
      ) : (
        <>
          <Media
            key={episode.id}
            ref={ref}
            controls
            autoPlay
            src={url}
            onLoadedMetadata={() => {
              if (ref.current)
                ref.current.currentTime = Math.min(
                  position,
                  ref.current.duration || position,
                );
            }}
            onPause={save}
            onEnded={save}
            onTimeUpdate={() => {
              if (Date.now() - last.current > 10000) {
                last.current = Date.now();
                save();
              }
            }}
            onError={() => {}}
          />
          <div className="player-controls">
            <button
              onClick={() => {
                if (ref.current)
                  ref.current.currentTime = Math.max(
                    0,
                    ref.current.currentTime - 15,
                  );
              }}
            >
              −15 s
            </button>
            <button
              onClick={() => {
                if (ref.current)
                  ref.current.currentTime = Math.min(
                    ref.current.duration,
                    ref.current.currentTime + 15,
                  );
              }}
            >
              +15 s
            </button>
            <select
              aria-label="Velocidad de reproducción"
              onChange={(e) => {
                if (ref.current)
                  ref.current.playbackRate = Number(e.target.value);
              }}
            >
              <option value="1">1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
