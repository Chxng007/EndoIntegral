import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Check, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { MemberTitle } from "../../components/layout/MemberLayout";
import {
  Button,
  EmptyState,
  Field,
  Loading,
  Modal,
  Notice,
  useToast,
} from "../../components/ui";
import { supabase, result } from "../../lib/supabase";
import { useRows } from "../../lib/hooks";
import { useAuth } from "../../lib/auth";
import {
  adminSections,
  MAX_ADMINS,
  planLabels,
  roleNames,
} from "../../lib/plans";
import { uploadFile } from "../../lib/uploads";
export default function AdminLayout() {
  return (
    <>
      <MemberTitle
        eyebrow="EQUIPO ENDOINTEGRAL"
        title="Cuidamos cada"
        accent="detalle"
        description="Gestiona los contenidos, las usuarias y las solicitudes de la comunidad."
      />
      <nav className="admin-tabs" aria-label="Administración">
        {adminSections.map(([path, label]) => (
          <NavLink
            key={path}
            to={`/admin${path ? "/" + path : ""}`}
            end={!path}
            className={({ isActive }) =>
              `chip ${isActive ? "admin-active" : ""}`
            }
            style={({ isActive }) =>
              isActive ? { background: "#8863a0", color: "white" } : {}
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
export function AdminHome() {
  const { rows: m } = useRows("profiles"),
    { rows: c } = useRows("contact_messages"),
    { rows: a } = useRows("appointment_requests");
  return (
    <>
      <div className="admin-stats">
        {[
          [
            m.filter((x) => x.activo && x.rol !== "admin").length,
            "Usuarias activas",
          ],
          [
            m.filter((x) => x.activo && x.rol === "admin").length,
            "Administradoras",
          ],
          [
            c.filter((x) => x.estado === "nuevo").length,
            "Mensajes por responder",
          ],
          [
            a.filter((x) => x.estado === "pendiente").length,
            "Solicitudes pendientes",
          ],
        ].map(([n, label]) => (
          <div className="card" key={label}>
            <strong>{n}</strong>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <Notice>
        Publica únicamente contenidos y datos profesionales verificados. El
        diario y los síntomas personales no se muestran en este panel.
      </Notice>
    </>
  );
}
export function AdminMembers() {
  const { rows, loading, error, refresh } = useRows("profiles");
  const { user } = useAuth();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [inviteRole, setInviteRole] = useState("miembra"),
    [created, setCreated] = useState(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("todas");
  const toast = useToast();
  const admins = rows.filter((p) => p.rol === "admin" && p.activo).length;
  const waiting = rows.filter((p) => p.rol !== "admin" && p.plan === "ninguno").length;
  const term = query.trim().toLowerCase();
  const visible = rows.filter(
    (p) =>
      (!term ||
        p.nombre?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term)) &&
      (filter === "todas" ||
        (filter === "sin-plan" && p.rol !== "admin" && p.plan === "ninguno") ||
        (filter === "equipo" && p.rol === "admin")),
  );
  // Al activar o cambiar un plan pagado se le avisa a la usuaria por correo.
  async function changePlan(p, plan) {
    try {
      await result(supabase.from("profiles").update({ plan }).eq("id", p.id));
      refresh();
      if (plan === "ninguno") {
        toast("La cuenta quedó sin plan.");
        return;
      }
      const { data } = await supabase.functions.invoke("notify-plan", {
        body: { user_id: p.id },
      });
      toast(
        data?.emailed
          ? `${planLabels[plan]} activado. Le avisamos a ${p.email || p.nombre} por correo.`
          : `${planLabels[plan]} activado.`,
      );
    } catch (e) {
      toast(e.message, "error");
    }
  }
  const full = admins >= MAX_ADMINS;
  async function update(p, changes, message) {
    try {
      await result(supabase.from("profiles").update(changes).eq("id", p.id));
      refresh();
      toast(message);
    } catch (e) {
      toast(e.message, "error");
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2>Usuarias y equipo</h2>
          <p style={{ fontSize: 12 }}>
            Administradoras activas: {admins} de {MAX_ADMINS} · Cuentas sin
            plan: {waiting}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Invitar persona
        </Button>
      </div>
      <div className="admin-filters">
        <input
          type="search"
          placeholder="Buscar por nombre o correo…"
          aria-label="Buscar por nombre o correo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filtrar cuentas"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="todas">Todas las cuentas</option>
          <option value="sin-plan">Sin plan (por activar)</option>
          <option value="equipo">Equipo</option>
        </select>
      </div>
      <Notice>
        Cuando alguien pague su plan, búscala por el correo que dejó en la
        solicitud y elige su plan aquí: se activa al instante y le avisamos por
        correo. Si aún no tiene cuenta, usa «Invitar persona».
      </Notice>
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : !rows.length ? (
        <EmptyState title="Aún no hay usuarias">
          Envía una invitación al confirmar una inscripción.
        </EmptyState>
      ) : (
        visible.map((p) => {
          const self = p.id === user?.id;
          return (
            <article key={p.id} className="admin-record">
              <h3>
                {p.nombre}
                {self && " (tú)"}
              </h3>
              {p.email && <p className="admin-email">{p.email}</p>}
              <div className="button-row">
                <select
                  aria-label={`Rol de ${p.nombre}`}
                  value={p.rol}
                  disabled={self}
                  title={self ? "No puedes cambiar tu propio rol." : undefined}
                  onChange={(e) =>
                    update(p, { rol: e.target.value }, "Rol actualizado.")
                  }
                >
                  <option value="miembra">{roleNames.miembra}</option>
                  <option value="admin" disabled={full && p.rol !== "admin"}>
                    {roleNames.admin}
                  </option>
                </select>
                {p.rol !== "admin" && (
                  <select
                    aria-label={`Plan de ${p.nombre}`}
                    value={p.plan}
                    onChange={(e) => changePlan(p, e.target.value)}
                  >
                    {Object.entries(planLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {value === "ninguno" ? "Sin plan (gratuita)" : label}
                      </option>
                    ))}
                  </select>
                )}
                {!self && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      update(p, { activo: !p.activo }, "Estado actualizado.")
                    }
                  >
                    {p.activo ? "Desactivar acceso" : "Activar acceso"}
                  </Button>
                )}
                <span className="badge">
                  {p.rol === "admin"
                    ? "Equipo · acceso completo"
                    : `${roleNames[p.rol] || p.rol} · ${planLabels[p.plan] || p.plan}`}
                </span>
              </div>
            </article>
          );
        })
      )}
      {open && (
        <Modal
          title={created ? "Cuenta creada" : "Invitar una persona"}
          eyebrow="EQUIPO ENDOINTEGRAL"
          onClose={() => {
            setOpen(false);
            setCreated(null);
          }}
        >
          {created ? (
            <>
              <Notice tone="error">
                La cuenta se creó, pero no pudimos enviar el correo. Comparte
                estos datos con la persona por un medio privado.
              </Notice>
              <div className="credentials">
                <span>Correo</span>
                <strong>{created.email}</strong>
                <span>Contraseña temporal</span>
                <strong className="credentials-password">
                  {created.password}
                </strong>
              </div>
              <div className="button-row">
                <Button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(
                        `Correo: ${created.email}
Contraseña temporal: ${created.password}
Ingresa en ${location.origin}/ingresar`,
                      )
                      .then(() => toast("Datos copiados."));
                  }}
                >
                  Copiar datos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    setCreated(null);
                  }}
                >
                  Listo
                </Button>
              </div>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const f = Object.fromEntries(new FormData(e.currentTarget));
                try {
                  const { data, error } = await supabase.functions.invoke(
                    "invite-member",
                    { body: f },
                  );
                  if (error || data?.error) {
                    // En errores la función responde 4xx: el mensaje real viene en error.context.
                    const detail = await error?.context
                      ?.json?.()
                      .catch(() => null);
                    throw new Error(
                      data?.error ||
                        detail?.error ||
                        "No se pudo enviar la invitación.",
                    );
                  }
                  refresh();
                  if (data.existing) {
                    setOpen(false);
                    toast(
                      data.emailed
                        ? `${f.email} ya tenía cuenta: le asignamos el plan y rol elegidos y le avisamos por correo.`
                        : `${f.email} ya tenía cuenta: le asignamos el plan y rol elegidos.`,
                    );
                  } else if (data.emailed) {
                    setOpen(false);
                    toast(`Invitación enviada a ${f.email}.`);
                  } else
                    setCreated({ email: f.email, password: data.password });
                } catch (e) {
                  toast(e.message, "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="Nombre completo">
                <input name="nombre" required minLength={3} maxLength={80} />
              </Field>
              <Field label="Correo electrónico">
                <input name="email" type="email" required />
              </Field>
              <Field label="Rol">
                <select
                  name="rol"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="miembra">{roleNames.miembra}</option>
                  <option value="admin" disabled={full}>
                    {roleNames.admin}
                    {full ? ` (límite de ${MAX_ADMINS} alcanzado)` : ""}
                  </option>
                </select>
              </Field>
              {inviteRole === "miembra" ? (
                <Field label="Plan">
                  <select name="plan" defaultValue="aprende">
                    {Object.entries(planLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {value === "ninguno" ? "Sin plan (gratuita)" : label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Notice>
                  Las administradoras tienen acceso completo a todos los módulos
                  y al panel del equipo.
                </Notice>
              )}
              <p style={{ fontSize: 12, margin: "4px 0 16px" }}>
                Le enviaremos un correo con su contraseña temporal. Al ingresar
                por primera vez deberá crear una nueva.
              </p>
              <Button type="submit" disabled={busy}>
                {busy ? "Enviando…" : "Enviar invitación"}
              </Button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
const subjectLabels = {
  general: "Información general",
  "plan-aprende": "Solicitud de plan · Plan 1 Aprende",
  "plan-orienta": "Solicitud de plan · Plan 2 Orienta",
  "plan-diagnostico": "Solicitud de plan · Plan 3 Diagnosticadas",
  acompanamiento: "Acompañamiento emocional",
  otro: "Otro",
};
// Celular colombiano de 10 dígitos → enlace de WhatsApp con el indicativo 57.
const whatsappLink = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? "57" + digits : digits}`;
};
export function AdminInbox({ appointments = false }) {
  const table = appointments ? "appointment_requests" : "contact_messages";
  const { rows, loading, error, refresh } = useRows(table, {
    select: appointments ? "*, profiles(nombre,email)" : "*",
  });
  const toast = useToast();
  return (
    <>
      <h2 style={{ fontSize: 31, marginBottom: 25 }}>
        {appointments
          ? "Solicitudes de acompañamiento"
          : "Mensajes de contacto"}
      </h2>
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : !rows.length ? (
        <EmptyState title="Todo al día">
          Los nuevos mensajes aparecerán aquí.
        </EmptyState>
      ) : (
        rows.map((r) => (
          <article className="admin-record" key={r.id}>
            <h3>
              {r.nombre ||
                r.profiles?.nombre ||
                `Solicitud · ${new Date(r.created_at).toLocaleDateString("es-CO")}`}
            </h3>
            {(r.email || r.profiles?.email) && (
              <a
                href={`mailto:${r.email || r.profiles.email}`}
                className="text-link"
              >
                {r.email || r.profiles.email}
              </a>
            )}
            <p>
              {r.asunto
                ? subjectLabels[r.asunto] || r.asunto
                : `${r.modalidad} · ${r.horario}`}
            </p>
            {r.telefono && (
              <p>
                {r.telefono} ·{" "}
                <a
                  className="text-link"
                  href={whatsappLink(r.telefono)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Escribir por WhatsApp
                </a>
              </p>
            )}
            <p style={{ margin: "14px 0" }}>{r.mensaje || r.motivo}</p>
            <select
              aria-label="Estado de la solicitud"
              value={r.estado}
              onChange={async (e) => {
                try {
                  await result(
                    supabase
                      .from(table)
                      .update({ estado: e.target.value })
                      .eq("id", r.id),
                  );
                  refresh();
                  toast("Estado guardado.");
                } catch (e) {
                  toast(e.message, "error");
                }
              }}
            >
              {(appointments
                ? ["pendiente", "confirmada", "realizada", "cancelada"]
                : ["nuevo", "respondido"]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {appointments && <AppointmentNote id={r.id} />}
          </article>
        ))
      )}
    </>
  );
}
function AppointmentNote({ id }) {
  const { rows, refresh } = useRows("appointment_team_notes");
  const current = rows.find((n) => n.appointment_id === id);
  const toast = useToast();
  return (
    <form
      style={{ marginTop: 20 }}
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await result(
            supabase.from("appointment_team_notes").upsert(
              {
                appointment_id: id,
                notas: new FormData(e.currentTarget).get("notas"),
              },
              { onConflict: "appointment_id" },
            ),
          );
          toast("Nota interna guardada.");
          refresh();
        } catch (e) {
          toast(e.message, "error");
        }
      }}
    >
      <Field label="Notas internas del equipo">
        <textarea
          key={current?.notas || "new"}
          name="notas"
          maxLength={4000}
          defaultValue={current?.notas || ""}
        />
      </Field>
      <Button variant="secondary" type="submit">
        Guardar nota interna
      </Button>
    </form>
  );
}
const configs = {
  podcasts: {
    table: "podcast_episodes",
    title: "Podcasts",
    fields: [
      ["titulo", "Título"],
      ["descripcion", "Descripción", "textarea"],
      ["tipo", "Tipo", "select", ["especialista", "testimonio"]],
      ["media_tipo", "Formato", "select", ["audio", "video", "youtube"]],
      ["youtube_id", "ID de YouTube (si aplica)", "optional"],
      ["duracion_seg", "Duración en segundos", "number"],
      ["publicado_at", "Fecha de publicación", "datetime-local"],
    ],
    file: {
      key: "storage_path",
      bucket: "podcasts",
      label: "Archivo de audio o video",
      accept: "audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,video/mp4,video/webm",
    },
  },
  profesionales: {
    table: "professionals",
    title: "Profesionales",
    fields: [
      ["nombre", "Nombre"],
      ["cargo", "Cargo"],
      ["anios_experiencia", "Años de experiencia", "number"],
      ["especialidades", "Especialidades (separadas por coma)", "array"],
      ["bio", "Presentación", "textarea"],
      ["video_id", "ID de YouTube (opcional)", "optional"],
      ["activo", "Visible en el sitio", "checkbox"],
    ],
    file: {
      key: "foto_url",
      bucket: "public-assets",
      label: "Fotografía profesional",
      accept: "image/jpeg,image/png,image/webp",
      publicUrl: true,
    },
  },
  recursos: {
    table: "resources",
    title: "Recursos y documentos",
    fields: [
      ["titulo", "Título"],
      [
        "categoria",
        "Categoría",
        "select",
        ["yoga", "mindfulness", "cartilla", "diario"],
      ],
      ["descripcion", "Descripción", "textarea"],
      ["orden", "Orden", "number"],
    ],
    file: {
      key: "pdf_path",
      bucket: "resources",
      label: "Documento PDF",
      accept: "application/pdf",
    },
  },
  videos: {
    table: "site_videos",
    title: "Videos del sitio",
    key: "clave",
    order: "clave",
    fields: [
      ["clave", "Clave de la sección"],
      ["youtube_id", "ID de YouTube (opcional)", "optional"],
      ["poster_url", "URL del póster (opcional)", "optional"],
    ],
    file: {
      key: "storage_path",
      bucket: "public-assets",
      label: "Video propio (opcional)",
      accept: "video/mp4,video/webm",
    },
  },
};
export function AdminContent({ kind }) {
  const config = configs[kind];
  const { rows, loading, error, refresh } = useRows(config.table, {
    order: config.order || "created_at",
  });
  const [editing, setEditing] = useState(null),
    [remove, setRemove] = useState(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0);
  const toast = useToast();
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setProgress(0);
    const f = new FormData(e.currentTarget);
    let uploaded = null;
    try {
      const payload = {};
      config.fields.forEach(([key, , type]) => {
        const value = f.get(key);
        payload[key] =
          type === "checkbox"
            ? value === "on"
            : type === "number"
              ? value
                ? Number(value)
                : 0
              : type === "array"
                ? String(value || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : type === "datetime-local"
                  ? value
                    ? new Date(value).toISOString()
                    : null
                  : value || null;
      });
      for (const key of ["youtube_id", "video_id"])
        if (payload[key] && !/^[\w-]{11}$/.test(payload[key]))
          throw new Error("El ID de YouTube debe tener 11 caracteres.");
      if (config.key && editing[config.key])
        payload[config.key] = editing[config.key];
      const file = f.get("file");
      if (file?.size) {
        uploaded = await uploadFile(config.file.bucket, file, setProgress);
        payload[config.file.key] = config.file.publicUrl
          ? supabase.storage.from(config.file.bucket).getPublicUrl(uploaded)
              .data.publicUrl
          : uploaded;
      }
      if (
        kind === "podcasts" &&
        payload.media_tipo !== "youtube" &&
        !payload.storage_path &&
        !editing.storage_path
      )
        throw new Error("Añade un archivo de audio o video.");
      if (
        kind === "podcasts" &&
        payload.media_tipo === "youtube" &&
        !payload.youtube_id
      )
        throw new Error("Añade el ID del video de YouTube.");
      if (kind === "recursos" && !payload.pdf_path && !editing.pdf_path)
        throw new Error("Añade el documento PDF.");
      // Un PDF nuevo reemplaza al anterior: las páginas del lector eran del documento viejo.
      if (kind === "recursos" && payload.pdf_path) {
        payload.carpeta = null;
        payload.paginas = null;
        payload.proporcion = null;
      }
      if (kind === "videos" && payload.youtube_id) payload.storage_path = null;
      const key = config.key || "id";
      const query = editing[key]
        ? supabase.from(config.table).update(payload).eq(key, editing[key])
        : supabase.from(config.table).insert(payload);
      await result(query);
      setEditing(null);
      refresh();
      toast("Contenido guardado.");
    } catch (e) {
      if (uploaded)
        await supabase.storage.from(config.file.bucket).remove([uploaded]);
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <h2>{config.title}</h2>
        <Button onClick={() => setEditing({})}>
          <Plus size={15} />
          Nuevo
        </Button>
      </div>
      {kind === "videos" && (
        <Notice>
          Usa las claves incluidas en el catálogo: inicio_validacion,
          programa_institucional, plan_diagnostico, plan_orienta, plan_aprende,
          endometriosis_definicion, endometriosis_mental,
          endometriosis_tratamiento, contacto_saludo, miembros_bienvenida,
          sintomas_tutorial, diario_tutorial, cartilla_tutorial.
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : !rows.length ? (
        <EmptyState title="Tu próximo contenido empieza aquí">
          Usa «Nuevo» para añadir un recurso al programa.
        </EmptyState>
      ) : (
        rows.map((r) => (
          <article className="admin-record" key={r[config.key || "id"]}>
            <h3>{r.titulo || r.nombre || r.clave}</h3>
            <p>{r.descripcion || r.bio || r.youtube_id || "Video pendiente"}</p>
            {r.publicado_at && (
              <p>
                Publicación: {new Date(r.publicado_at).toLocaleString("es-CO")}
              </p>
            )}
            <div className="button-row">
              <Button variant="secondary" onClick={() => setEditing(r)}>
                <Pencil size={14} />
                Editar
              </Button>
              <Button variant="plain" onClick={() => setRemove(r)}>
                <Trash2 size={14} />
                Eliminar
              </Button>
            </div>
          </article>
        ))
      )}
      {editing && (
        <Modal
          title={`${editing[config.key || "id"] ? "Editar" : "Nuevo"} · ${config.title}`}
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form onSubmit={save}>
            {config.fields.map(([key, label, type, options]) => (
              <Field key={key} label={label}>
                {type === "textarea" ? (
                  <textarea
                    name={key}
                    required
                    defaultValue={editing[key] || ""}
                    maxLength={5000}
                  />
                ) : type === "select" ? (
                  <select name={key} defaultValue={editing[key] || options[0]}>
                    {options.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                ) : type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={key}
                    defaultChecked={editing[key] ?? true}
                  />
                ) : (
                  <input
                    name={key}
                    type={
                      ["number", "datetime-local"].includes(type)
                        ? type
                        : "text"
                    }
                    min={type === "number" ? 0 : undefined}
                    required={
                      !["optional", "number", "datetime-local"].includes(type)
                    }
                    defaultValue={
                      type === "array"
                        ? (editing[key] || []).join(", ")
                        : type === "datetime-local"
                          ? editing[key]
                            ? new Date(
                                new Date(editing[key]).getTime() -
                                  new Date(editing[key]).getTimezoneOffset() *
                                    60000,
                              )
                                .toISOString()
                                .slice(0, 16)
                            : ""
                          : (editing[key] ?? "")
                    }
                    maxLength={type === "optional" ? 500 : 200}
                    readOnly={key === config.key && Boolean(editing[key])}
                  />
                )}
              </Field>
            ))}
            <Field label={config.file.label}>
              <input
                className="drop-zone"
                name="file"
                type="file"
                accept={config.file.accept}
              />
            </Field>
            {editing[config.file.key] && (
              <p style={{ fontSize: 11, marginBottom: 15 }}>
                Ya tiene un archivo. Selecciona otro para reemplazarlo.
              </p>
            )}
            {busy && (
              <div>
                <div className="progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p style={{ fontSize: 11 }}>
                  {progress < 100
                    ? `Subiendo… ${progress}%`
                    : "Guardando contenido…"}
                </p>
              </div>
            )}
            <Button type="submit" disabled={busy}>
              <Upload size={15} />
              {busy ? "Guardando…" : "Guardar contenido"}
            </Button>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal
          title="¿Eliminar este contenido?"
          onClose={() => setRemove(null)}
        >
          <p>
            Dejará de estar disponible en el programa. El archivo se conserva en
            Storage hasta la revisión del equipo.
          </p>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await result(
                  supabase
                    .from(config.table)
                    .delete()
                    .eq(config.key || "id", remove[config.key || "id"]),
                );
                setRemove(null);
                refresh();
                toast("Contenido eliminado.");
              } catch (e) {
                toast(e.message, "error");
              }
            }}
          >
            Eliminar contenido
          </Button>
        </Modal>
      )}
    </>
  );
}
export function AdminForum() {
  const { rows: posts, refresh } = useRows("forum_posts"),
    { rows: reports, refresh: refreshReports } = useRows("forum_reports");
  const toast = useToast();
  return (
    <>
      <h2 style={{ fontSize: 30, marginBottom: 25 }}>
        Reportes de la comunidad
      </h2>
      {reports.filter((r) => !r.resuelto).length ? (
        reports
          .filter((r) => !r.resuelto)
          .map((r) => (
            <div className="admin-record" key={r.id}>
              <span className="badge">
                {r.target_tipo === "reply" ? "Respuesta" : "Publicación"}
              </span>
              <p>{r.motivo}</p>
              <p>ID del contenido: {r.target_id}</p>
              <div className="button-row">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await result(
                        supabase
                          .from(
                            r.target_tipo === "reply"
                              ? "forum_replies"
                              : "forum_posts",
                          )
                          .update({ oculto: true })
                          .eq("id", r.target_id),
                      );
                      toast("Contenido oculto.");
                      refresh();
                    } catch (e) {
                      toast(e.message, "error");
                    }
                  }}
                >
                  Ocultar contenido
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await result(
                        supabase
                          .from("forum_reports")
                          .update({ resuelto: true })
                          .eq("id", r.id),
                      );
                      refreshReports();
                      toast("Reporte resuelto.");
                    } catch (e) {
                      toast(e.message, "error");
                    }
                  }}
                >
                  Marcar resuelto
                </Button>
              </div>
            </div>
          ))
      ) : (
        <EmptyState title="Sin reportes pendientes">
          Las publicaciones señaladas se mostrarán en esta sección.
        </EmptyState>
      )}
      <h2 style={{ fontSize: 30, margin: "35px 0 20px" }}>Publicaciones</h2>
      {[...posts]
        .sort((a, b) => Number(b.riesgo) - Number(a.riesgo))
        .map((p) => (
          <article className="admin-record" key={p.id}>
            {p.riesgo && (
              <Notice>
                Revisión prioritaria. La señal automática no sustituye una
                evaluación profesional.
              </Notice>
            )}
            <p>{p.contenido}</p>
            <p style={{ fontSize: 10 }}>ID de autora: {p.user_id}</p>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await result(
                    supabase
                      .from("forum_posts")
                      .update({ oculto: !p.oculto })
                      .eq("id", p.id),
                  );
                  refresh();
                  toast("Visibilidad actualizada.");
                } catch (e) {
                  toast(e.message, "error");
                }
              }}
            >
              {p.oculto ? "Restaurar" : "Ocultar"}
            </Button>
          </article>
        ))}
    </>
  );
}
