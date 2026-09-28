import { useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { formsEnabled, supabase } from "../lib/supabase";
import { Button, Loading, Notice } from "../components/ui";

export default function ProtectedRoute({ admin = false }) {
  const { user, profile, loading, error, consent, setConsent, signOut } =
    useAuth();
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (error || !profile?.activo)
    return (
      <section className="container section">
        <Notice>
          {error ||
            "Tu membresía no está activa. Contacta al equipo para revisar tu acceso."}
        </Notice>
        <Button onClick={signOut} variant="secondary">
          Cerrar sesión
        </Button>
      </section>
    );
  if (admin)
    return profile.rol === "admin" ? (
      <Outlet />
    ) : (
      <Navigate to="/app" replace />
    );
  if (!consent)
    return (
      <section className="container section" style={{ maxWidth: 650 }}>
        <h1 style={{ fontSize: 39, marginBottom: 25 }}>
          Tu privacidad <em>importa.</em>
        </h1>
        <p style={{ fontSize: 14, marginBottom: 25 }}>
          Antes de registrar información de salud, lee nuestra política y decide
          si autorizas su tratamiento para acceder a tus herramientas de
          bienestar.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const { error } = await supabase.from("consents").insert({
              user_id: user.id,
              tipo: "datos_sensibles",
              version: "1.0",
            });
            if (error)
              setFailure(
                "No pudimos guardar tu autorización. Intenta nuevamente.",
              );
            else setConsent(true);
            setBusy(false);
          }}
        >
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>
              He leído la <Link to="/privacidad">política de tratamiento</Link>{" "}
              y autorizo expresamente el tratamiento de mis datos sensibles para
              las funciones del programa.
            </span>
          </label>
          {!formsEnabled && (
            <Notice>
              El acceso a los registros estará disponible cuando el equipo
              termine de habilitar el servicio.
            </Notice>
          )}
          {failure && <Notice tone="error">{failure}</Notice>}
          <div className="button-row" style={{ marginTop: 20 }}>
            <Button disabled={busy || !formsEnabled} type="submit">
              Aceptar y continuar
            </Button>
            <Button type="button" onClick={signOut} variant="secondary">
              Cerrar sesión
            </Button>
          </div>
        </form>
      </section>
    );
  return <Outlet />;
}
