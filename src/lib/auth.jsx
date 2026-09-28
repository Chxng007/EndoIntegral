import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const load = useCallback(async (session) => {
    setUser(session?.user ?? null);
    setProfile(null);
    setConsent(false);
    setError("");
    if (session?.user) {
      const [p, c] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("consents")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("tipo", "datos_sensibles")
          .eq("version", "1.0")
          .limit(1),
      ]);
      if (p.error || c.error)
        setError(
          "No pudimos cargar tu membresía. Intenta ingresar nuevamente.",
        );
      else {
        setProfile(p.data);
        setConsent(Boolean(c.data?.length));
      }
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
    setUser(null);
    setProfile(null);
    setConsent(false);
  }
  return (
    <AuthContext.Provider
      value={{ user, profile, consent, setConsent, loading, error, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
