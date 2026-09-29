import { useEffect, useRef, useState } from "react";
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
  // «checking» mientras se valida el enlace del correo; «ready» cuando ya hay sesión para cambiarla.
  const [link, setLink] = useState(update ? "checking" : "none");
  useEffect(() => {
    if (user && !update) navigate("/app", { replace: true });
  }, [user, update, navigate]);
  const verified = useRef(false);
  useEffect(() => {
    if (!supabase || !update || verified.current) return;
    verified.current = true; // el token solo se puede canjear una vez
    const tokenHash = params.get("token_hash"),
      code = params.get("code");
    const invalid = () => {
      setLink("invalid");
      setStatus({
        error: true,
        text: "Este enlace ya se usó o caducó. Pide uno nuevo con «¿Olvidaste tu contraseña?».",
      });
    };
    // Enlace del correo de EndoIntegral: funciona en cualquier navegador.
    if (tokenHash)
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error }) => {
          if (error) invalid();
          else {
            setLink("ready");
            // Evita reutilizar el token si se recarga la página.
            navigate("/ingresar?modo=contrasena", { replace: true });
          }
        });
    // Enlaces antiguos de Supabase (solo sirven en el mismo navegador donde se pidieron).
    else if (code)
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) invalid();
        else setLink("ready");
      });
    else
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setLink("ready");
        else if (link === "checking") invalid();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);
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
        if (error)
          throw new Error(
            /session/i.test(error.message)
              ? "Tu enlace caducó. Pide uno nuevo con «¿Olvidaste tu contraseña?»."
              : /different|same/i.test(error.message)
                ? "La nueva contraseña debe ser distinta a la anterior."
                : "No pudimos guardar tu contraseña. Intenta con otra.",
          );
        // Si venía de una invitación, ya no hace falta pedirle que la cambie.
        await supabase.rpc("mark_password_changed");
        navigate("/app", { replace: true });
      } else if (mode === "reset") {
        const { data, error } = await supabase.functions.invoke(
          "reset-password",
          { body: { email: values.get("email") } },
        );
        if (error || data?.error) {
          const detail = await error?.context?.json?.().catch(() => null);
          throw new Error(
            data?.error ||
              detail?.error ||
              "No pudimos enviar el enlace. Intenta nuevamente.",
          );
        }
        setStatus({
          text: "Si el correo está registrado, te enviamos un enlace para crear una contraseña nueva. Revisa también Spam.",
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
                    // Evita que el campo pierda el foco (en iPhone eso cancelaba el cambio).
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => setShow((s) => !s)}
                    aria-pressed={show}
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
                    type={show ? "text" : "password"}
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                </Field>
              )}
            </>
          )}
          {update && link === "checking" && (
            <Notice>Verificando tu enlace…</Notice>
          )}
          <Button
            disabled={busy || (update && link !== "ready")}
            type="submit"
          >
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
        {update && link === "invalid" && (
          <button
            className="forgot"
            onClick={() => {
              setMode("reset");
              setStatus(null);
              navigate("/ingresar", { replace: true });
            }}
          >
            Pedir un enlace nuevo
          </button>
        )}
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
