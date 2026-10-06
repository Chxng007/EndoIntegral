import { useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { formsEnabled, supabase } from "../lib/supabase";
import { Button, Field, Loading, Notice } from "../components/ui";

// Primer ingreso con la contraseña temporal del correo de invitación.
function FirstPassword() {
  const { user, setProfile, signOut } = useAuth();
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  return (
    <section className="container section" style={{ maxWidth: 560 }}>
      <div className="first-password card">
        <img
          src="/img/logo-circular.jpeg"
          alt=""
          width="72"
          height="72"
          className="first-password-logo"
        />
        <p className="eyebrow">BIENVENIDA A ENDOINTEGRAL</p>
        <h1>
          Crea tu <em>contraseña.</em>
        </h1>
        <p>
          Ingresaste con una contraseña temporal. Elige una nueva para{" "}
          <strong>{user.email}</strong>; la usarás desde ahora para entrar.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setFailure("");
            if (f.get("password") !== f.get("confirm")) {
              setFailure("Las contraseñas no coinciden.");
              return;
            }
            setBusy(true);
            const { error } = await supabase.auth.updateUser({
              password: f.get("password"),
            });
            if (error) {
              setFailure(
                /different|same/i.test(error.message)
                  ? "La nueva contraseña debe ser distinta a la temporal."
                  : "No pudimos guardar tu contraseña. Intenta con otra.",
              );
              setBusy(false);
              return;
            }
            const { data, error: markError } = await supabase.rpc(
              "mark_password_changed",
            );
            if (markError)
              setFailure("Tu contraseña se guardó, pero recarga la página.");
            else setProfile(data);
            setBusy(false);
          }}
        >
          <Field label="Nueva contraseña">
            <input
              type="password"
              name="password"
              minLength={10}
              required
              autoComplete="new-password"
            />
          </Field>
          <Field label="Repite la contraseña">
            <input
              type="password"
              name="confirm"
              minLength={10}
              required
              autoComplete="new-password"
            />
          </Field>
          <p style={{ fontSize: 11, margin: "0 0 18px" }}>
            Mínimo 10 caracteres.
          </p>
          {failure && <Notice tone="error">{failure}</Notice>}
          <div className="button-row">
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando…" : "Guardar y entrar"}
            </Button>
            <Button type="button" variant="secondary" onClick={signOut}>
              Cerrar sesión
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function ProtectedRoute({ admin = false }) {
  const { user, profile, loading, error, consent, setConsent, signOut } =
    useAuth();
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  // Mientras llega el perfil se muestra la carga, nunca el aviso de membresía inactiva.
  if (loading || (user && !profile && !error)) return <Loading />;
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
  if (profile.debe_cambiar_contrasena) return <FirstPassword />;
  if (admin)
    return profile.rol === "admin" ? (
      <Outlet />
    ) : (
      <Navigate to="/app" replace />
    );
  // La cuenta gratuita no registra datos de salud: la autorización se pide al activar un plan.
  if (!consent && (profile.rol === "admin" || profile.plan !== "ninguno"))
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
