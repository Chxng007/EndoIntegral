import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button, Field, Notice } from "../../components/ui";
import { supabase, unavailableMessage } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
export default function Ingresar() {
  const [show, setShow] = useState(false),
    [mode, setMode] = useState("login"),
    [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const update = params.get("modo") === "contrasena";
  useEffect(() => {
    if (user && !update) navigate("/app", { replace: true });
  }, [user, update, navigate]);
  useEffect(() => {
    if (!supabase || !update) return;
    const code = params.get("code");
    if (code)
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error)
          setStatus({
            error: true,
            text: "El enlace ya no es válido. Solicita uno nuevo al equipo.",
          });
      });
  }, [params, update]);
  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    if (!supabase) {
      setStatus({ error: true, text: unavailableMessage });
      return;
    }
    const values = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (update) {
        const password = values.get("password");
        if (password !== values.get("confirm"))
          throw new Error("Las contraseñas no coinciden.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        navigate("/app", { replace: true });
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.get("email"),
          { redirectTo: `${window.location.origin}/ingresar?modo=contrasena` },
        );
        if (error) throw error;
        setStatus({
          text: "Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.get("email"),
          password: values.get("password"),
        });
        if (error)
          throw new Error(
            "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
          );
        navigate("/app", { replace: true });
      }
    } catch (e) {
      setStatus({ error: true, text: e.message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="login-section">
      <div className="login-card">
        <img
          src="/img/logo-circular.jpeg"
          alt="Símbolo de EndoIntegral"
          width={76}
          height={76}
        />
        <h1>
          {update
            ? "Tu nueva contraseña"
            : mode === "reset"
              ? "Recupera tu acceso"
              : "Bienvenida de vuelta"}
        </h1>
        <p>
          {update
            ? "Elige una contraseña de al menos 10 caracteres."
            : mode === "reset"
              ? "Te enviaremos un enlace para volver a tu espacio."
              : "Ingresa con tu correo y contraseña de EndoIntegral."}
        </p>
        <form onSubmit={submit}>
          {!update && (
            <Field label="Correo electrónico">
              <input
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </Field>
          )}
          {(mode === "login" || update) && (
            <>
              <Field label={update ? "Nueva contraseña" : "Contraseña"}>
                <div className="password-wrap">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    placeholder="Tu contraseña"
                    required
                    minLength={update ? 10 : undefined}
                    autoComplete={update ? "new-password" : "current-password"}
                    aria-label={update ? "Nueva contraseña" : "Contraseña"}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShow(!show)}
                    aria-label={
                      show ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>
              {update && (
                <Field label="Confirma la contraseña">
                  <input
                    name="confirm"
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                </Field>
              )}
            </>
          )}
          <Button disabled={busy} type="submit">
            <LockKeyhole size={15} />
            {busy
              ? "Un momento…"
              : update
                ? "Guardar contraseña"
                : mode === "reset"
                  ? "Enviar enlace"
                  : "Iniciar sesión"}
          </Button>
        </form>
        {!update && (
          <button
            className="forgot"
            onClick={() => {
              setMode(mode === "login" ? "reset" : "login");
              setStatus(null);
            }}
          >
            {mode === "login"
              ? "¿Olvidaste tu contraseña?"
              : "Volver a iniciar sesión"}
          </button>
        )}
        {status && (
          <Notice tone={status.error ? "error" : "success"}>
            {status.text}
          </Notice>
        )}
        <div className="signup-note">
          ¿Aún no tienes membresía?
          <Link to="/programa">Conoce el programa →</Link>
        </div>
      </div>
    </section>
  );
}
