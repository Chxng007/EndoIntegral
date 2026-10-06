import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button, Field, Notice } from "../../components/ui";
import { supabase, unavailableMessage } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
export default function Ingresar() {
  const [params] = useSearchParams();
  const [show, setShow] = useState(false),
    // login · reset (recuperar contraseña) · register (cuenta gratuita)
    [mode, setMode] = useState(
      params.get("modo") === "registro" ? "register" : "login",
    ),
    [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const update = params.get("modo") === "contrasena";
  const confirming = params.get("modo") === "confirmar";
  // «checking» mientras se valida el enlace del correo; «ready» cuando ya hay sesión para cambiarla.
  const [link, setLink] = useState(update ? "checking" : "none");
  useEffect(() => {
    if (user && !update) navigate("/app", { replace: true });
  }, [user, update, navigate]);
  const verified = useRef(false);
  // Enlace del correo de confirmación de una cuenta gratuita nueva.
  useEffect(() => {
    if (!supabase || !confirming || verified.current) return;
    verified.current = true;
    const tokenHash = params.get("token_hash");
    if (!tokenHash) return;
    setStatus({ text: "Confirmando tu cuenta…" });
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: "signup" })
      .then(({ error }) => {
        if (error) {
          setMode("login");
          setStatus({
            error: true,
            text: "Este enlace ya se usó o caducó. Si ya confirmaste tu cuenta, inicia sesión con tu correo y contraseña.",
          });
          navigate("/ingresar", { replace: true });
        } else navigate("/app", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirming]);
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
    const form = e.currentTarget,
      values = new FormData(form);
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
      } else if (mode === "register") {
        const password = values.get("password");
        if (password !== values.get("confirm"))
          throw new Error("Las contraseñas no coinciden.");
        const { data, error } = await supabase.functions.invoke("register", {
          body: {
            nombre: values.get("nombre"),
            email: values.get("email"),
            password,
          },
        });
        if (error || data?.error) {
          const detail = await error?.context?.json?.().catch(() => null);
          throw new Error(
            data?.error ||
              detail?.error ||
              "No pudimos crear tu cuenta. Intenta nuevamente.",
          );
        }
        form.reset();
        setStatus({
          text: `Te enviamos un correo a ${values.get("email")} para confirmar tu cuenta. Abre el enlace y entrarás a tu espacio (revisa también Spam). Si ya tenías una cuenta con ese correo, inicia sesión o usa «¿Olvidaste tu contraseña?».`,
        });
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
              : mode === "register"
                ? "Crea tu cuenta gratis"
                : "Bienvenida de vuelta"}
        </h1>
        <p>
          {update
            ? "Elige una contraseña de al menos 10 caracteres."
            : mode === "reset"
              ? "Te enviaremos un enlace para volver a tu espacio."
              : mode === "register"
                ? "Conoce tu espacio y solicita el plan que necesitas. Las herramientas de cada plan se activan cuando el equipo confirma tu inscripción."
                : "Ingresa con tu correo y contraseña de EndoIntegral."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && !update && (
            <Field label="¿Cómo te llamas?">
              <input
                name="nombre"
                placeholder="Tu nombre"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
            </Field>
          )}
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
          {(mode === "login" || mode === "register" || update) && (
            <>
              <Field label={update ? "Nueva contraseña" : "Contraseña"}>
                <div className="password-wrap">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    placeholder="Tu contraseña"
                    required
                    minLength={update || mode === "register" ? 10 : undefined}
                    autoComplete={
                      update || mode === "register"
                        ? "new-password"
                        : "current-password"
                    }
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
              {(update || mode === "register") && (
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
          {mode === "register" && !update && (
            <label className="checkbox-label" style={{ marginBottom: 16 }}>
              <input type="checkbox" required />
              <span>
                Acepto la{" "}
                <Link to="/privacidad">política de tratamiento de datos</Link>.
                La contraseña debe tener mínimo 10 caracteres.
              </span>
            </label>
          )}
          {update && link === "checking" && (
            <Notice>Verificando tu enlace…</Notice>
          )}
          <Button disabled={busy || (update && link !== "ready")} type="submit">
            <LockKeyhole size={15} />
            {busy
              ? "Un momento…"
              : update
                ? "Guardar contraseña"
                : mode === "reset"
                  ? "Enviar enlace"
                  : mode === "register"
                    ? "Crear mi cuenta"
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
        {!update && mode !== "register" && (
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
        {!update && (
          <div className="signup-note">
            {mode === "register"
              ? "¿Ya tienes cuenta?"
              : "¿Aún no tienes cuenta?"}
            <button
              type="button"
              className="signup-switch"
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setStatus(null);
              }}
            >
              {mode === "register"
                ? "Iniciar sesión →"
                : "Crear cuenta gratis →"}
            </button>
            <Link to="/programa#planes">Conoce los planes</Link>
          </div>
        )}
      </div>
    </section>
  );
}
