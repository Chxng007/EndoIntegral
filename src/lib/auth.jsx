import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "./supabase";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");
  // Id de la persona cuyo perfil ya está cargado (o cargándose) y número de la última petición.
  // Evita volver a pedir el perfil —y mostrar «membresía no activa» mientras llega— cuando
  // Supabase repite el evento de sesión al recargar o refresca el token.
  const loadedFor = useRef(null);
  const request = useRef(0);
  const load = useCallback(async (session, force = false) => {
    const uid = session?.user?.id ?? null;
    if (!uid) {
      loadedFor.current = null;
      request.current++;
      setUser(null);
      setProfile(null);
      setConsent(false);
      setError("");
      setLoading(false);
      return;
    }
    setUser(session.user);
    if (uid === loadedFor.current && !force) return;
    loadedFor.current = uid;
    const id = ++request.current;
    setLoading(true);
    setError("");
    const [p, c] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase
        .from("consents")
        .select("id")
        .eq("user_id", uid)
        .eq("tipo", "datos_sensibles")
        .eq("version", "1.0")
        .limit(1),
    ]);
    if (id !== request.current) return;
    // La sesión es válida pero la cuenta ya no tiene perfil (se borró): se cierra la sesión y
    // la página de ingreso avisa que la cuenta no existe.
    if (p.error?.code === "PGRST116" || (!p.error && !p.data)) {
      try {
        sessionStorage.setItem("endo-cuenta-eliminada", "1");
      } catch {
        /* El aviso es opcional. */
      }
      loadedFor.current = null;
      setProfile(null);
      setUser(null);
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }
    if (p.error || c.error) {
      loadedFor.current = null;
      setProfile(null);
      setError("No pudimos cargar tu membresía. Intenta ingresar nuevamente.");
    } else {
      setProfile(p.data);
      setConsent(Boolean(c.data?.length));
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        setError("No pudimos recuperar tu sesión.");
        setLoading(false);
      } else load(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer database queries until the Auth callback releases its lock.
      setTimeout(() => {
        if (alive) load(session);
      }, 0);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [load]);
  async function signOut() {
    await supabase?.auth.signOut();
    loadedFor.current = null;
    request.current++;
    setUser(null);
    setProfile(null);
    setConsent(false);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        consent,
        setConsent,
        loading,
        error,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
