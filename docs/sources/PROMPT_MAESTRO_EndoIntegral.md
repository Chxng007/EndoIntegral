# PROMPT MAESTRO — Plataforma web EndoIntegral

> Copia todo este documento y pégalo como primer mensaje al agente de IA (Claude Design, Claude Code, v0, Cursor, etc.). Está escrito para que el agente no tenga que preguntar nada que ya esté decidido aquí.

---

## 0. TU ROL

Actúas simultáneamente como tres perfiles senior trabajando en equipo:

1. **Gerente de proyecto técnico.** Respetas el alcance, el orden de entrega y los criterios de aceptación de este documento. Si algo no está definido, no lo inventas: lo marcas como `// TODO(cliente): ...` y sigues. Al terminar cada entrega, listas qué quedó hecho, qué quedó pendiente y qué necesitas del cliente.
2. **Ingeniero frontend experto en React (JSX).** Código limpio, componentes pequeños y reutilizables, accesible (WCAG 2.1 AA), responsive mobile-first, sin dependencias innecesarias. Entregas archivos completos, listos para copiar y pegar, uno por módulo, sin fragmentos sueltos ni "…resto igual".
3. **Agente especialista en Three.js y modelado 3D.** Dominas `three`, `@react-three/fiber`, `@react-three/drei` y `@react-three/postprocessing`, optimización de GLB (Draco/Meshopt, KTX2), materiales PBR, animación ligada a scroll y rendimiento en móviles de gama media. El 3D es parte de la narrativa educativa, no decoración: cada escena explica algo.

Explica brevemente el *por qué* de cada decisión técnica o de diseño importante (el cliente lo valora), pero no rellenes con texto de más.

---

## 1. CONTEXTO DEL PROYECTO

**EndoIntegral** es una IPS (institución prestadora de servicios de salud, Colombia) dedicada a la atención integral de mujeres con **endometriosis**. Articula atención clínica, salud mental, nutrición, educación para el autocuidado, acompañamiento psicosocial y herramientas digitales en una ruta coordinada.

- **Eslogan:** "Cuerpo, mente y bienestar en equilibrio"
- **Instagram:** [@endo_integral](https://www.instagram.com/endo_integral/)
- **Símbolo:** mariposa lavanda/rosa con destello de cuatro puntas.

**Objetivos del sitio:**
1. Validar emocionalmente ("No eres una exagerada") y educar con información confiable.
2. Presentar los 3 planes y convertir en contacto/inscripción.
3. Dar a las miembras inscritas un espacio privado con herramientas de seguimiento, comunidad y recursos.

**Tono:** cálido, cercano, validante, nunca alarmista ni gráfico. Nada de imágenes anatómicas explícitas o sangrientas. Tuteo ("tú"). Lenguaje claro, sin tecnicismos innecesarios.

**Público:** mujeres (y personas menstruantes) con diagnóstico o sospecha de endometriosis, sus familias y parejas. Muchas llegan desde el celular y en días de dolor o fatiga: la interfaz debe ser fácil de usar con poca energía.

---

## 2. STACK TÉCNICO (decidido)

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | React 18 + Vite, **JSX** (no TypeScript) | Rápido de iterar, el cliente pidió JSX |
| Enrutamiento | `react-router-dom` v6 | Rutas públicas y privadas anidadas |
| Estilos | Tailwind CSS v4 con tokens propios (sección 3) | Consistencia con la paleta |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` | Integración declarativa con React |
| Animación UI | `framer-motion` (solo transiciones que responden a acciones) | Ligero, respeta reduced-motion |
| Backend | **Supabase** (Auth, Postgres, Storage, Edge Functions, Row Level Security) | Login, foro, historial y archivos sin montar servidor propio |
| Correo | Supabase Edge Function + **Resend** | Notificaciones de formularios al equipo |
| Formularios | `react-hook-form` + `zod` | Validación clara |
| Despliegue | Vercel | CI/CD simple, preview por rama |

### Estructura de carpetas

```
src/
  app/
    router.jsx
    ProtectedRoute.jsx
    AdminRoute.jsx
  lib/
    supabase.js
    videos.js            // catálogo central de videos (sección 5)
    content/             // textos del sitio en JS, NO hardcodeados en componentes
      inicio.js
      programa.js
      endometriosis.js
      recursos.js
  components/
    layout/  (Navbar, Footer, MemberSidebar, PageHeader)
    ui/      (Button, Card, Chip, Input, Select, Textarea, Badge, Modal, Toast, EmptyState)
    video/   (VideoEmbed, AmbientVideo, VideoSlot)
    three/   (SceneCanvas, ReproductiveModel, ButterflyField, EndoLesions, useScrollStage, QualityGate)
  pages/
    public/  (Inicio, Programa, Endometriosis, Contacto, Ingresar, Privacidad)
    member/  (MemberHome, EndoVoces, Acompanamiento, Sintomas, Foro, Diario, Cartilla, Recursos, RecursoYoga, RecursoMindfulness)
    admin/   (AdminHome, AdminPodcasts, AdminMiembras, AdminMensajes, AdminSolicitudes, AdminForo, AdminRecursos)
  styles/
    tokens.css
public/
  models/endo_reproductive.glb
  video/  (loops ambientales .mp4/.webm + posters .jpg)
  pdf/    (cartilla, diario, yoga, mindfulness)
  img/    (logo, logo-circular, qr-instagram, equipo/)
supabase/
  migrations/
  functions/notify-team/
```

### Rutas

| Ruta | Acceso | Página |
|---|---|---|
| `/` | Pública | Inicio |
| `/programa` | Pública | Conocer el programa |
| `/endometriosis` | Pública | Hablemos de endometriosis |
| `/contacto` | Pública | Contáctanos |
| `/ingresar` | Pública | Yo soy miembra (login) |
| `/privacidad` | Pública | Política de tratamiento de datos |
| `/app` | Miembra | Tu espacio de bienestar (inicio privado) |
| `/app/endo-voces` | Miembra | Podcast |
| `/app/acompanamiento` | Miembra | Acompañamiento emocional |
| `/app/sintomas` | Miembra | Registro de síntomas |
| `/app/foro` | Miembra | Foro de la comunidad |
| `/app/diario` | Miembra | Diario terapéutico |
| `/app/cartilla` | Miembra | Cartilla psicoeducativa |
| `/app/recursos` | Miembra | Recursos descargables (índice) |
| `/app/recursos/yoga` | Miembra | Yoga terapia |
| `/app/recursos/mindfulness` | Miembra | Mindfulness |
| `/admin/*` | Admin | Panel del equipo EndoIntegral |

---

## 3. IDENTIDAD VISUAL

### Paleta oficial (del manual de marca — obligatoria)

| Nombre | Hex | Uso |
|---|---|---|
| Lavanda profundo | `#8E6CB3` | Marca, acentos, íconos, bordes activos |
| Lavanda | `#CBB4E6` | Fondos de tarjetas destacadas, chips, degradados |
| Rosa empolvado | `#E7C6D8` | Fondos suaves, chips, degradados |
| Amarillo pastel | `#FDE7A7` | Avisos, badges destacados, "destellos" (máx. 1 por pantalla) |
| Crema | `#FFF9EE` | Fondo base de página |
| Blanco | `#FFFFFF` | Tarjetas, inputs |

### Tokens derivados (necesarios por accesibilidad — explica al cliente por qué)

Los colores oficiales son claros; texto blanco sobre `#8E6CB3` no alcanza contraste AA para texto normal. Se derivan:

| Token | Hex | Uso |
|---|---|---|
| `--plum-ink` | `#3B2A4D` | Texto principal |
| `--plum-soft` | `#6E5A80` | Texto secundario |
| `--lavender-deep-700` | `#6B4A91` | Botones primarios con texto blanco, enlaces |
| `--rose-cta` | `#D98BB0` | Inicio del degradado del CTA |
| `--border-soft` | `#EADCF0` | Bordes de tarjetas e inputs |
| `--pastel-ink` | `#7A5A12` | Texto sobre amarillo pastel |

CTA principal: degradado `linear-gradient(135deg, var(--rose-cta), var(--lavender-deep-700))`, texto blanco, forma píldora. Footer: degradado rosa → lavanda (como en las referencias).

### Tipografía
- **Titulares:** Playfair Display (400/600, con itálica). La palabra clave de cada titular va en itálica y color lavanda profundo, igual que en las referencias ("Tu espacio de *bienestar*", "Sobre *nosotros*").
- **Cuerpo y UI:** Nunito (400/600/700).
- Escala: 14 / 16 / 18 / 24 / 32 / 44 / 64 px. Interlineado del cuerpo 1.7. Largo de línea máximo ~70 caracteres.

### Componentes
- Tarjetas: fondo blanco, radio 20px, borde 1px `--border-soft`, sombra muy suave con tinte lavanda.
- Botones: píldora (radio 9999px). Primario = degradado; secundario = contorno rosa/lavanda.
- Chips seleccionables (ánimo, síntomas, dolor 0–10): píldoras con estado activo en rosa/lavanda.
- Avisos: fondo amarillo pastel, borde punteado, texto `--pastel-ink` (como el recuadro "Sobre esta cartilla" de la referencia).
- Encabezado de página interna (`PageHeader`): franja con degradado suave lavanda → crema, enlace "← Volver al inicio", badge de sección y título.
- Íconos: emojis como en las referencias o Lucide; elegir UNO de los dos sistemas y mantenerlo en todo el sitio.
- Logo: usar los archivos oficiales (horizontal y circular). No redibujarlo.

### Reglas
- Modo oscuro opcional (tokens preparados), pero el diseño base es claro.
- Foco visible en todo elemento interactivo.
- `prefers-reduced-motion`: desactiva animaciones de cámara, partículas y videos en autoplay (muestra el póster).
- Imágenes con `alt` descriptivo; videos con título accesible.

---

## 4. SISTEMA 3D (Three.js / React Three Fiber)

### 4.1 Modelo principal: sistema reproductor femenino estilizado

**Estilo:** estilizado, suave, "de vidrio" en tonos de la paleta. Educativo pero amable. NO realista ni quirúrgico.

**Opción A (recomendada): GLB modelado en Blender**
- Archivo: `public/models/endo_reproductive.glb`, 15–25k triángulos, comprimido con Draco o Meshopt (< 1,5 MB).
- Mallas con nombres exactos (el código depende de ellos): `Utero`, `Cervix`, `Trompa_L`, `Trompa_R`, `Fimbrias_L`, `Fimbrias_R`, `Ovario_L`, `Ovario_R`, `Peritoneo` (lámina translúcida envolvente), `Ligamentos`, `Vejiga`, `Recto`.
- Empties/anchors para lesiones: `Anchor_Peritoneo_01..08`, `Anchor_Ovario_L_01..03`, `Anchor_Ovario_R_01..03`, `Anchor_Profunda_01..06` (hacia vejiga, recto, ligamentos).
- Normales suaves, UVs limpios, escala real en metros, origen centrado en el útero.

**Opción B (fallback inmediato, mientras llega el GLB):** modelo procedural en código con `LatheGeometry` (útero), `TubeGeometry` sobre `CatmullRomCurve3` (trompas), `IcosahedronGeometry` deformada (ovarios), un plano curvo translúcido (peritoneo) y esferas simples para vejiga/recto. Misma API de nombres que el GLB para poder cambiarlo sin tocar el resto del código.

**Materiales (`MeshPhysicalMaterial`):**
- Útero y trompas: color `#E7C6D8`, `roughness 0.35`, `clearcoat 0.6`, `sheen 1`, `sheenColor #FFF9EE`.
- Ovarios: `#CBB4E6` con `emissive #8E6CB3` a intensidad baja (0.15).
- Peritoneo: `transmission 0.9`, `thickness 0.4`, `opacity` baja, tono crema.
- Vejiga/recto: gris lavanda muy desaturado, casi siempre al 20% de opacidad (solo protagonistas en Tipo III/IV).
- Lesiones (`EndoLesions`): pequeñas esferas instanciadas (`InstancedMesh`) color `#8E6CB3` con pulso emisivo suave. Nunca rojo.

**Iluminación:** `Environment` de drei con preset suave ("studio" o "apartment") + una luz direccional cálida + una luz de relleno rosada. Bloom muy sutil (`intensity ≤ 0.4`) solo en emisivos.

### 4.2 Campo de mariposas (`ButterflyField`)
Motivo de marca. 30–60 mariposas low-poly (dos alas con `PlaneGeometry` + shader de aleteo en el vértice), instanciadas, en tonos lavanda/rosa/amarillo pastel, flotando lento alrededor del modelo. En móvil gama baja: 12 o se reemplaza por partículas 2D.

### 4.3 Escenas por página (cámara ligada al scroll)

Implementa `useScrollStage(sectionRefs)` con `IntersectionObserver`: devuelve el índice de la sección activa. La cámara y los estados del modelo interpolan con easing `cubicInOut` (~1,2 s) hacia el estado de esa sección. Un solo `<Canvas>` fijo detrás del contenido por página (no uno por sección).

**Inicio (`/`)**
| Etapa | Cámara | Modelo |
|---|---|---|
| Hero | Plano general, modelo a la derecha en desktop / detrás y atenuado en móvil | Rotación lenta continua, mariposas alrededor |
| Tarjetas de beneficios | Se aleja un poco | Mariposas se dispersan suavemente |
| Bloque de validación | Plano cercano al útero | Brillo suave "respira" |

**Hablemos de endometriosis (`/endometriosis`)** — aquí el 3D es educativo:
| Sección | Qué muestra el 3D |
|---|---|
| Definición | Plano general; aparecen lesiones fuera del útero para explicar "tejido fuera de la cavidad uterina" |
| Síntomas | Pulso suave en zona pélvica |
| Tipo I – Peritoneal superficial | Lesiones solo sobre `Peritoneo` y superficie de ovarios, aisladas |
| Tipo II – Ovárica | Zoom a ovarios; ovario con un endometrioma (esfera interna oscura lavanda) |
| Tipo III – Profunda | Lesiones que "penetran" hacia `Vejiga`, `Recto`, `Ligamentos` (que suben de opacidad) |
| Tipo IV – Severa | Todas las lesiones + hilos finos entre órganos (adherencias) con `Line` de drei |
| Tratamiento | Lesiones se desvanecen progresivamente (mensaje de esperanza) |

Los tipos deben poder verse también con **pestañas clicables** (Tipo I…IV), no solo con scroll: accesibilidad y usuarias que no hacen scroll lento.

**Ingresar (`/ingresar`):** solo `ButterflyField` muy tenue de fondo, sin modelo.

**Área de miembras:** sin 3D pesado (prioridad: rapidez en días de fatiga). Opcional: una mariposa 3D pequeña animada en el saludo del panel.

### 4.4 Rendimiento (obligatorio)
- `<Canvas dpr={[1, 1.75]}>`, `frameloop="demand"` cuando el canvas no está visible.
- `PerformanceMonitor` de drei: si baja de 45 fps, desactivar bloom, bajar mariposas y DPR.
- Carga diferida: `React.lazy` + `Suspense` con póster estático (`/img/modelo-poster.webp`) mientras carga el GLB.
- `useGLTF.preload` solo en las páginas que lo usan.
- Detección de WebGL: si no hay soporte, mostrar el póster.
- Con `prefers-reduced-motion`: modelo estático sin rotación, sin transiciones de cámara (cambios instantáneos), sin mariposas.
- Presupuesto: LCP < 2,5 s en 4G; el texto del hero debe pintarse antes que el 3D.

---

## 5. SISTEMA DE VIDEO ("video en todo")

### 5.1 Componentes
- **`VideoEmbed`** — YouTube con dominio `youtube-nocookie.com`, patrón *facade*: se muestra la miniatura + botón play y el iframe solo se carga al hacer clic (rendimiento y privacidad). Props: `id`, `title`, `channel`, `duration`, `start`. Relación 16:9, radio 20px.
- **`AmbientVideo`** — video propio en loop (`muted autoPlay loop playsInline`, `.webm` + `.mp4`, póster). Se pausa si sale de pantalla o con reduced-motion. Sin audio, nunca contiene información esencial.
- **`VideoSlot`** — espacio reservado para un video que el cliente aún no entrega: muestra póster ilustrado con mariposa y el texto "Video próximamente". Toma el video desde `src/lib/videos.js`; cuando el cliente ponga el ID, aparece solo, sin tocar componentes.

**Regla:** no inventes URLs ni IDs de YouTube. Solo se usan los reales de la sección 5.2; el resto va como `VideoSlot` con `TODO(cliente)`.

### 5.2 Videos reales entregados por el cliente (usar tal cual)

**Yoga terapia** (del PDF "Yoga Terapia para la Endometriosis"):
| # | Título | Canal / nota | URL |
|---|---|---|---|
| 1 | Yoga para aliviar síntomas de endometriosis | YogaconSil · práctica suave | https://www.youtube.com/watch?v=gx4bJ9bIHWk |
| 2 | ¿Tienes endometriosis? Realiza esta postura o la clase completa | Atmaniyoga | https://www.youtube.com/watch?v=gnyOCJHvl3Y |
| 3 | Yoga para la endometriosis y para el dolor pélvico | La Cabaña del Bienestar | https://www.youtube.com/watch?v=dCu3CkytAc8 |
| 4 | Mini práctica de yoga para aliviar el dolor menstrual y la endometriosis | Susana C. · 12 posturas suaves | https://www.youtube.com/watch?v=CoPLA9usFoI |
| 5 | Meditación guiada para aliviar el dolor en 5 minutos | — | https://youtu.be/Wa-1Z0jpspI |
| 6 | 5 minutos mágicos para calmar el sistema nervioso | Meditación guiada | https://youtu.be/_lOpSbsm9y4 |

**Mindfulness** (del PDF "Meditaciones Mindfulness Guiadas"):
| # | Título | Descripción | URL |
|---|---|---|---|
| 01 | Meditación guiada para aliviar el dolor | Relajación y atención plena | https://youtu.be/Wa-1Z0jpspI |
| 02 | 5 minutos mágicos para calmar el sistema nervioso | Práctica breve enfocada en la calma | https://youtu.be/_lOpSbsm9y4 |
| 03 | Meditación guiada mindfulness de 10 minutos | Atención plena y relajación | https://youtu.be/9-IOMXpv7Ys |
| 04 | Meditación guiada mindfulness: paz interior y atención plena | Clase completa | https://youtu.be/Q94RfVNboDI |

Nota: los videos 5 y 6 de yoga son los mismos que 01 y 02 de mindfulness. En `videos.js` se definen una sola vez y se referencian desde ambas páginas.

### 5.3 Mapa de videos por página

| Página / sección | Tipo | Contenido | Estado |
|---|---|---|---|
| Inicio – hero | `AmbientVideo` detrás del 3D (capa inferior, opacidad 15–25%) | Loop abstracto: seda/luz lavanda, flores al viento, agua suave | TODO(cliente) o stock libre (Pexels/Coverr, licencia comercial) |
| Inicio – validación | `VideoSlot` | Mensaje corto del equipo (30–60 s) "No eres una exagerada" | TODO(cliente) |
| Programa – Quiénes somos | `VideoSlot` | Video institucional presentando EndoIntegral | TODO(cliente) |
| Programa – cada plan | `VideoSlot` por plan (en modal "Ver video del plan") | Explicación de 1 min de cada plan | TODO(cliente) |
| Endometriosis – definición | `VideoSlot` | Video explicativo de fuente confiable o propio | TODO(cliente): elegir fuente médica verificada |
| Endometriosis – salud mental | `VideoSlot` | Psicóloga del equipo hablando del impacto emocional | TODO(cliente) |
| Endometriosis – tratamiento | `VideoSlot` | Especialista explicando opciones | TODO(cliente) |
| Contáctanos | `VideoSlot` | Saludo del equipo invitando a escribir | TODO(cliente) |
| Área privada – inicio | `VideoSlot` | Bienvenida y tour del área de miembras | TODO(cliente) |
| Endo-Voces | Audio y/o video por episodio | Podcast (sección 7.1) | Carga desde panel admin |
| Acompañamiento | `VideoSlot` por profesional | Presentación de 30 s de cada profesional | TODO(cliente) |
| Registro de síntomas | `VideoSlot` | Tutorial de 1 min: cómo registrar | TODO(cliente) o grabación de pantalla |
| Diario / Cartilla | `VideoSlot` | Cómo usar el diario / la cartilla | TODO(cliente) |
| Yoga | `VideoEmbed` ×6 | Tabla 5.2 | ✅ Real |
| Mindfulness | `VideoEmbed` ×4 | Tabla 5.2 | ✅ Real |
| Foro | Soporte para pegar un enlace de YouTube en una publicación y mostrarlo embebido | — | Funcionalidad |

Todos los videos propios se suben a Supabase Storage (bucket `videos`) o a YouTube como "no listado", y se administran desde el panel admin (sección 9).

---

## 6. PÁGINAS PÚBLICAS (contenido completo)

> Los textos van en `src/lib/content/*.js`. Donde dice "tal cual", se copian literal.

### 6.1 Navbar (todas las páginas públicas)
- Izquierda: logo (mariposa + "EndoIntegral" + "Cuerpo, mente y bienestar").
- Centro: `Inicio` · `Hablemos de endometriosis` · `Programa` · `Contáctanos`.
- Derecha: botón contorno `Mi cuenta` (va a `/ingresar`, o a `/app` si ya hay sesión) y botón primario `Contáctanos`.
- Móvil: menú hamburguesa con panel lateral; los dos botones siempre visibles abajo del panel.
- Fondo translúcido con desenfoque al hacer scroll.

### 6.2 Footer (todas las páginas)
Degradado rosa → lavanda. Columnas: marca + eslogan · Secciones (Inicio, Hablemos de endometriosis, Programa, Contáctanos) · Miembras (Yo soy miembra) · Contacto (Instagram, correo). Línea final: "© 2026 EndoIntegral · Política de tratamiento de datos · Este sitio no reemplaza la consulta médica."

### 6.3 INICIO (`/`)

**Hero** (composición como la referencia: texto abajo a la izquierda, tarjetas a la derecha; fondo degradado crema → rosa empolvado → lavanda; 3D y video ambiental detrás)
- Badge (amarillo pastel, punteado): "Comunidad y acompañamiento en endometriosis"
- H1: "No eres una *exagerada*. Tu dolor merece un cuidado integral." ("exagerada" en itálica rosa; segunda frase en lavanda profundo)
- Párrafo: "EndoIntegral acompaña cuerpo, mente y hábitos diarios de mujeres con endometriosis, con educación clara, contención emocional y un programa guiado paso a paso."
- Botones (mismos textos y orden de la referencia):
  1. Primario: "Conocer el programa →" → `/programa`
  2. Contorno: "Hablemos de endometriosis" → `/endometriosis`
  3. Contorno: "Yo soy miembra — Entrar" → `/ingresar`

**Tarjetas de beneficios** (grilla 2×2 junto al hero; en móvil, debajo):
| Tarjeta | Texto | Enlace |
|---|---|---|
| 📖 Educación clara | Información médica accesible, sin tecnicismos. | `/endometriosis` |
| 🧘 Bienestar diario | Hábitos y check-ins que se adaptan a tus días. | `/programa` |
| 🗺️ Mapa de niveles | Progresa por fases: Calma, Tormenta y Renacer. | Muestra badge "Próximamente" (fase 2) |
| 🎧 Endo-Voces | Podcast exclusivo para días de fatiga. | `/ingresar` con candado 🔒 |

**Bloque de validación emocional** (debajo del hero): mensaje destacado de que el dolor no es normal y merece atención especializada; `VideoSlot` del mensaje del equipo; botón a `/programa`.

**Vista previa del programa:** 3 tarjetas resumidas de los planes (nombre, duración, a quién va dirigido) → `/programa#planes`.

**Vista previa del área de miembras (bloqueada):** grilla con los 7 módulos privados (Endo-Voces, Acompañamiento, Síntomas, Foro, Diario, Cartilla, Recursos), cada uno con ícono y candado, texto: "Al inscribirte en un plan recibes acceso a tu espacio privado." Botón "Yo soy miembra — Entrar".

**Instagram:** franja final "Síguenos en @endo_integral" con botón al perfil.

### 6.4 CONOCER EL PROGRAMA (`/programa`)

`PageHeader`: badge "🌸 Quiénes somos", título "Conocer el *programa*".

**¿Quiénes somos?** (tal cual)
> EndoIntegral es una iniciativa de servicios de salud orientada a la atención integral de mujeres con endometriosis. El modelo articula atención clínica, salud mental, nutrición, educación para el autocuidado, acompañamiento psicosocial y herramientas digitales dentro de una ruta coordinada de atención. Su estructura empresarial busca responder a las necesidades físicas y emocionales asociadas con la enfermedad, reducir la fragmentación de los servicios y desarrollar una operación sostenible mediante diferentes fuentes de ingresos, alianzas estratégicas y servicios presenciales y digitales.

+ `VideoSlot` institucional.

**Motivo de creación** (tal cual, en recuadro amarillo pastel punteado)
> EndoIntegral nace ante la necesidad de ofrecer una atención más completa a las mujeres con endometriosis. La enfermedad puede afectar de manera simultánea la salud física, el bienestar emocional, las relaciones sociales, la vida académica o laboral y la calidad de vida. A esto se suman dificultades como el retraso diagnóstico, la normalización del dolor, la desinformación y la falta de acompañamiento psicológico e interdisciplinario.
>
> La empresa se crea para integrar en una misma ruta de atención los servicios que con frecuencia se reciben de forma aislada. El propósito es que cada paciente pueda acceder a orientación especializada, seguimiento clínico, apoyo psicológico, educación, autocuidado y redes de apoyo de manera coordinada, continua y centrada en sus necesidades.

**Misión y Visión** (dos tarjetas lado a lado, borde superior rosa y lavanda)
- 🎯 **Misión:** Brindar atención integral y especializada a mujeres con endometriosis mediante un modelo interdisciplinario que articula atención clínica, salud mental, educación y herramientas digitales, promoviendo el autocuidado, el bienestar emocional y una mejor calidad de vida.
- 👁️ **Visión:** Ser una IPS líder y referente en Colombia en la atención integral de la endometriosis, reconocida por su excelencia clínica, enfoque interdisciplinario, innovación digital y modelo de atención humanizado, contribuyendo de manera sostenible al bienestar y la calidad de vida de las mujeres con esta enfermedad.

**Valores institucionales** (6 tarjetas horizontales con ícono)
- **Empatía:** Comprendemos y validamos la experiencia de cada paciente, ofreciendo un trato respetuoso, cercano y humanizado.
- **Rigor científico:** Orientamos las intervenciones y contenidos a partir de conocimiento científico, evidencia disponible y ejercicio profesional responsable.
- **Integralidad:** Comprendemos la salud de la paciente desde sus dimensiones física, psicológica y social, procurando una atención coordinada.
- **Respeto:** Reconocemos la dignidad, privacidad, autonomía, decisiones y particularidades de cada mujer.
- **Innovación:** Incorporamos herramientas tecnológicas y estrategias de atención que facilitan el acceso, el seguimiento y la educación en salud.
- **Trabajo interdisciplinario:** Promovemos la colaboración entre profesionales para ofrecer una atención organizada, coherente y centrada en la paciente.

**Planes** (`id="planes"`) — 3 tarjetas comparables lado a lado (en móvil, carrusel con snap). Cada una: nombre, badge de duración, "Para quién", objetivo, lista "Incluye" desplegable, botón "Quiero este plan" → `/contacto?asunto=plan-X`, y botón "Ver video del plan" (`VideoSlot` en modal). Plan 1 destacado visualmente (borde lavanda profundo, badge "Premium"). Precio: `TODO(cliente)`.

**PLAN 1 — EndoIntegral Diagnóstico** · 10 semanas · Premium
*Para:* mujeres con diagnóstico confirmado de endometriosis.
*Objetivo:* fortalecer el bienestar psicológico y las estrategias de afrontamiento frente a la endometriosis, integrando evaluación inicial, psicoeducación, regulación emocional, autocuidado, redes de apoyo y seguimiento.
*Incluye:*
- Entrevista semiestructurada individual.
- Tamizaje psicológico inicial y post-test.
- Talleres psicoeducativos sobre endometriosis, dolor crónico, ansiedad, depresión y estrés.
- Cartilla psicoeducativa física y digital.
- Talleres de regulación emocional y diario terapéutico.
- Mindfulness, respiración consciente y yoga terapéutico adaptado.
- Talleres de autocuidado y bienestar.
- Grupos de apoyo entre mujeres.
- Un encuentro de sensibilización para familiares o pareja.

**PLAN 2 — EndoIntegral Orienta** · 8 semanas
*Para:* mujeres con síntomas compatibles o sospecha de endometriosis, sin diagnóstico confirmado.
*Objetivo:* ofrecer educación, identificación de necesidades emocionales, herramientas de afrontamiento y orientación para una búsqueda oportuna de atención profesional, sin establecer diagnósticos desde el programa.
*Incluye:*
- Entrevista inicial centrada en síntomas, impacto emocional y necesidades.
- Tamizaje psicológico para detectar señales de riesgo emocional.
- Talleres de educación sobre endometriosis, dolor, ansiedad, estrés y bienestar.
- Cartilla digital de autocuidado y afrontamiento.
- Regulación emocional, diario terapéutico y respiración consciente.
- Mindfulness y yoga.
- Taller de autocuidado y bienestar.
- Grupo de apoyo y orientación sobre redes de apoyo.
- Seguimiento y cierre con recomendaciones de continuidad.

**PLAN 3 — EndoIntegral Aprende** · 6 semanas
*Para:* cualquier persona interesada en aprender sobre endometriosis y salud mental.
*Objetivo:* ampliar el conocimiento sobre endometriosis, su impacto físico, emocional y social, y enseñar estrategias generales de autocuidado, regulación emocional y apoyo a personas cercanas.
*Incluye:*
- Taller introductorio sobre endometriosis y mitos frecuentes.
- Psicoeducación sobre dolor crónico, ansiedad, depresión, estrés y bienestar.
- Cartilla educativa digital.
- Taller práctico de regulación emocional.
- Sesión de mindfulness y respiración consciente.
- Sesión de movimiento/yoga suave orientada al bienestar.
- Taller de autocuidado y hábitos saludables.
- Espacio de sensibilización para familiares, parejas, amigos o cuidadores.
- Materiales digitales de continuidad.

Debajo: tabla comparativa compacta (Duración, Para quién, Tamizaje, Cartilla física, Grupo de apoyo, Encuentro familiar) y CTA final a `/contacto`.

### 6.5 HABLEMOS DE ENDOMETRIOSIS (`/endometriosis`)

Canvas 3D fijo con las escenas de la sección 4.3. El texto va en columna izquierda (desktop) o sobre el 3D con fondo translúcido (móvil).

**Definición** (tal cual) + `VideoSlot`
> La endometriosis es una patología ginecológica crónica, inflamatoria y altamente prevalente que afecta a mujeres en edad reproductiva. Según la 11° Clasificación Internacional de Enfermedades (CIE-11) de la Organización Mundial de la Salud (OMS), se define como una enfermedad del útero caracterizada por la presencia y crecimiento de tejido endometrial fuera de la cavidad uterina (como en los ovarios, los ligamentos útero-sacros, las trompas de Falopio, la vagina o el recto). Este tejido ectópico no puede ser expulsado correctamente, lo que genera reacciones inflamatorias crónicas, tejido cicatrizal, hemorragias internas y lesiones o adherencias en la pelvis.

**⚡ Síntomas más frecuentes** (tal cual, 8 tarjetas en grilla 4×2)
| Ícono | Síntoma | Descripción |
|---|---|---|
| 😣 | Dolor pélvico | Dolor crónico o durante la menstruación que no cede con analgésicos. |
| 🩸 | Menstruación dolorosa | Dismenorrea intensa que interfiere con actividades diarias. |
| 😴 | Fatiga | Cansancio persistente que no mejora con el descanso. |
| 👶 | Infertilidad | Dificultad para concebir en algunos casos. |
| 🚽 | Malestar intestinal | Dolor al defecar, diarrea o estreñimiento especialmente menstrual. |
| 💑 | Dolor durante relaciones | Dispareunia: dolor durante o después del sexo. |
| 😔 | Cambios en el ánimo | Ansiedad, depresión y afectación de la calidad de vida. |
| 🤢 | Náuseas | Especialmente durante el período menstrual. |

**Tipos de endometriosis** (pestañas Tipo I–IV sincronizadas con el 3D)
- **Tipo I – Peritoneal superficial:** Implantes superficiales en el peritoneo y ovarios, generalmente aislados y sin adherencias importantes.
- **Tipo II – Ovárica:** Presencia de endometriomas, quistes con contenido marrón oscuro, que pueden generar adherencias.
- **Tipo III – Profunda:** Infiltración de más de 5 mm en el peritoneo; puede comprometer intestino, vejiga y uréteres.
- **Tipo IV – Severa:** Diseminación extensa con implantes superficiales y profundos y adherencias complejas.

**💊 Opciones de tratamiento** (tal cual, 4 tarjetas con borde superior de color)
| Ícono | Opción | Descripción |
|---|---|---|
| 💊 | Manejo farmacológico | Anticonceptivos hormonales, progestágenos, análogos de la GnRH y analgésicos para controlar síntomas. |
| 🔬 | Cirugía laparoscópica | Intervención mínimamente invasiva para eliminar los focos de endometriosis y mejorar la calidad de vida. |
| 🧘 | Tratamiento complementario | Fisioterapia pélvica, nutrición antiinflamatoria, mindfulness y ejercicio adaptado. |
| 💜 | Apoyo psicológico | Fundamental para manejar el impacto emocional de vivir con una enfermedad crónica. Botón: "Ver acompañamiento →" (→ `/programa#planes` si no hay sesión, `/app/acompanamiento` si la hay) |

+ `VideoSlot` de tratamiento. Aviso: "Esta información es educativa. Las decisiones de tratamiento se toman con tu equipo médico."

**Endometriosis y salud mental** (texto)
> La endometriosis es una condición con importantes implicaciones psicológicas. Se describen ansiedad, depresión y estrés como problemas observados con frecuencia, relacionados con factores como dolor crónico, incertidumbre diagnóstica, infertilidad, intervenciones quirúrgicas, estigma, aislamiento y dificultades en el acceso a atención.

**¿Cómo afecta la endometriosis a la salud mental?** (tal cual, 6 tarjetas 3×2 con borde lateral de color) + `VideoSlot`
| Ícono | Área | Descripción |
|---|---|---|
| 😢 | Depresión | Las mujeres con endometriosis tienen hasta el doble de probabilidad de desarrollar depresión, relacionada con el dolor crónico y las limitaciones cotidianas. |
| 😰 | Ansiedad | La anticipación del dolor y la incertidumbre sobre el futuro generan altos niveles de ansiedad. |
| 🤝 | Relaciones sociales | El dolor puede limitar la participación social, provocando aislamiento y deterioro de relaciones. |
| 💑 | Vida íntima y de pareja | El dolor durante las relaciones y el impacto en la fertilidad pueden generar conflictos y baja autoestima. |
| 💼 | Trabajo y estudios | El absentismo laboral y la incomprensión del entorno generan estrés adicional significativo. |
| 🪞 | Imagen corporal | Los cambios físicos y los efectos de los tratamientos hormonales pueden afectar la percepción del propio cuerpo. |

**Prevención y promoción de la salud mental en EndoIntegral** (3 columnas con ícono: 🌱 Promover · 🛡️ Mitigar · 🔍 Prevenir)

*Lo que se va a promover:*
- **Salud mental y bienestar integral:** Promover espacios de apoyo emocional, autonomía y el desarrollo de recursos internos en las pacientes.
- **Atención interdisciplinaria y humanizada:** Fomentar una ruta coordinada que integre la ginecología, la psicología, la nutrición y el autocuidado.
- **Educación y validación:** Divulgar información confiable sobre la enfermedad, validando el dolor de las pacientes para combatir la desinformación y el estigma social.

*Lo que se va a mitigar:*
> Para mitigar el impacto emocional y psicológico, se busca disminuir los síntomas de ansiedad, depresión, estrés crónico, baja autoestima y los altibajos hormonales derivados de la enfermedad. Asimismo, para abordar el sufrimiento y la normalización del dolor, es fundamental reducir la minimización cultural del dolor menstrual y el aislamiento emocional mediante el fortalecimiento de redes de apoyo y talleres de regulación emocional. Finalmente, frente a la fragmentación de los servicios, se pretende disminuir la desolación, la incertidumbre y las barreras de acceso a una atención oportuna.

*Lo que se va a prevenir:*
> Para prevenir los trastornos mentales, se busca evitar el desarrollo de patologías asociadas a través de la detección temprana mediante tamizajes psicológicos y procesos psicoeducativos orientados al afrontamiento. Asimismo, frente a las consecuencias del diagnóstico tardío, se pretende prevenir y mitigar el riesgo de infertilidad y las secuelas relacionales y sociales por medio de una intervención oportuna.

**Tus derechos (Colombia)** — sección breve con acordeón, redactada con palabras propias (no copiar el artículo), citando como fuente el blog de Scola Abogados (dic. 2025). Puntos:
- Ley 2388 de 2023: política pública de prevención, diagnóstico temprano y tratamiento integral; el empleador puede acordar trabajo flexible o en casa.
- Ley 2644 de 2025: permisos remunerados para citas, urgencias y tratamientos, que no pueden sancionarse si están soportados.
- Resolución 2068 de 2025 (Minsalud): adopta la política pública; entornos laborales saludables, sin discriminación, reconocimiento de incapacidades.
- Sentencia T-448 de 2023: la Corte Constitucional reconoce que la endometriosis puede afectar la capacidad laboral.
- Aviso: "Información general, no constituye asesoría legal." `TODO(cliente)`: confirmar si desean incluir esta sección.

CTA final: "¿Te identificas con estos síntomas? Conoce el plan Orienta" → `/programa#planes`.

### 6.6 CONTÁCTANOS (`/contacto`)

Layout de 2 columnas: formulario (izq.) + tarjeta Instagram (der.). `VideoSlot` del saludo del equipo arriba.

**Formulario "Envíanos un mensaje"** (tarjeta con borde punteado rosa, como la referencia):
| Campo | Tipo | Validación |
|---|---|---|
| Nombre | texto, placeholder "Tu nombre completo" | requerido, 3–80 caracteres |
| Correo electrónico | email, "tu@email.com" | requerido, formato válido |
| Asunto | select: Información general · Plan Diagnóstico · Plan Orienta · Plan Aprende · Acompañamiento emocional · Otro | requerido; se precarga con `?asunto=` |
| Teléfono (opcional) | tel, "+57 300 000 0000" | formato colombiano si se llena |
| Mensaje | textarea, "Cuéntanos en qué podemos ayudarte..." | requerido, 10–2000 caracteres |
| Autorización de datos | checkbox obligatorio con enlace a `/privacidad` | requerido |
| Honeypot anti-spam | campo oculto | debe ir vacío |

Botón: "Enviar mensaje 💜". Al enviar: insert en `contact_messages` → Edge Function `notify-team` envía correo al equipo vía Resend (`TODO(cliente)`: correo destino) → toast "Mensaje enviado. Te responderemos pronto." Estados de carga y error claros.

**Tarjeta Instagram:** QR oficial (`/img/qr-instagram.png`, el que entregó el cliente, color mostaza) + texto "@endo_integral" + botón "Abrir Instagram" (enlace directo; en celular no se puede escanear el QR de la propia pantalla).

### 6.7 YO SOY MIEMBRA (`/ingresar`)

Tarjeta centrada sobre degradado (como la referencia) con mariposas 3D tenues:
- Ícono mariposa, título "Bienvenida de vuelta", subtítulo "Ingresa con tu usuario y contraseña de EndoIntegral."
- Correo, contraseña (con mostrar/ocultar), botón "Iniciar sesión".
- "¿Olvidaste tu contraseña?" → flujo de recuperación de Supabase.
- "¿Aún no tienes membresía? Conoce el programa" → `/programa`.
- **Eliminar** el recuadro "Modo demo" y el botón "Entrar directo" de la referencia (no pueden existir en producción).
- Las cuentas NO se autoregistran: las crea el equipo desde el panel admin al inscribir a una usuaria (fase 1). La usuaria recibe correo de invitación para crear su contraseña.
- Primer ingreso: pantalla de consentimiento informado de tratamiento de datos sensibles (obligatoria, se guarda en `consents`).

---

## 7. ÁREA DE MIEMBRAS (`/app/*`, requiere sesión)

**Layout** (como la referencia): navbar pública arriba + **sidebar izquierdo** + contenido.
- Sidebar: avatar (emoji de flor), "Hola de nuevo, {nombre}", plan activo. Menú en este orden:
  1. 🏠 Inicio
  2. 🎧 Endo-Voces
  3. 💜 Acompañamiento emocional
  4. 📋 Registro de síntomas
  5. 💬 Foro de la comunidad
  6. 📓 Diario terapéutico
  7. 📘 Cartilla psicoeducativa
  8. 🌿 Recursos para tu bienestar (submenú: Yoga terapia · Mindfulness)
  9. ↩ Cerrar sesión
- Móvil: el sidebar se convierte en barra inferior con los 5 más usados + "Más".
- **Botón de ayuda urgente** fijo y discreto en toda el área: abre modal con líneas de atención en salud mental (`TODO(cliente)`: verificar números vigentes, p. ej. línea nacional del Minsalud) y aviso "Si estás en peligro, llama al 123".

### 7.0 Inicio privado (`/app`)
Badge "Área de miembras", título "Tu espacio de *bienestar*". `VideoSlot` de bienvenida. Tarjetas de acceso rápido: último registro de síntomas ("Hace 2 días registraste dolor 6/10" o "Aún no registras hoy → Registrar"), último episodio de Endo-Voces, última publicación del foro, próximo paso del plan.

### 7.1 Endo-Voces (`/app/endo-voces`)
- Subtítulo: "Escúchalo mientras descansas en tus días de fatiga."
- Grilla de episodios (tarjeta con botón play circular rosa, título, descripción, "24 min · Especialista" / "Testimonio").
- Filtros: Todos · Especialista · Testimonio.
- Reproductor persistente abajo (sigue sonando al cambiar de página dentro de `/app`), con velocidad 1x/1.25x/1.5x, adelantar/retroceder 15 s y reanudar donde quedó (guardar progreso en `podcast_progress`).
- Episodios pueden ser **audio** (mp3/m4a) o **video** (mp4 o YouTube no listado).
- Archivos en bucket privado `podcasts`, servidos con URL firmada de corta duración.
- **Cómo sube el equipo un episodio:** Panel admin → Podcasts → "Nuevo episodio" → arrastrar archivo, título, descripción, tipo, portada opcional, publicar ahora o programar. Explica este flujo en el README para el cliente.
- Estado vacío: "Muy pronto escucharás aquí el primer episodio de Endo-Voces 🎧".
- Los 4 episodios de la imagen de referencia son solo ejemplo visual: NO cargarlos como datos reales.

### 7.2 Acompañamiento emocional (`/app/acompanamiento`)
`PageHeader` morado (como la referencia): badge "💜 Apoyo profesional", "Acompañamiento *emocional*", "Profesionales especializadas en enfermedades crónicas y salud femenina, listas para acompañarte."

**Nuestro equipo 🌸:** tarjetas por profesional (foto o emoji, nombre, cargo y años, chips de especialidad, bio corta, `VideoSlot` de presentación, botón "Agendar sesión" que precarga el formulario). Datos desde tabla `professionals` administrable. Los nombres de la referencia son inventados: `TODO(cliente)` datos reales.

**Solicitar una sesión de orientación** (formulario, borde punteado):
| Campo | Tipo |
|---|---|
| Nombre completo | texto (precargado) |
| Correo electrónico | email (precargado) |
| Teléfono (opcional) | tel |
| Profesional preferida | select: Sin preferencia + profesionales |
| Modalidad | select: Videollamada · Presencial · Llamada telefónica |
| Horario preferido | select: Mañana (8–12h) · Tarde (12–18h) · Noche (18–20h) |
| ¿Qué te motivó a contactarnos? | textarea, "Cuéntanos brevemente qué estás viviendo..." |

Botón "Enviar solicitud 💜" → `appointment_requests` + correo al equipo. La usuaria ve abajo "Mis solicitudes" con estado (Pendiente · Confirmada · Realizada · Cancelada), que el equipo cambia desde el admin. Texto "Primera sesión gratuita · Sin compromisos" de la referencia: `TODO(cliente)` confirmar si aplica.

### 7.3 Registro de síntomas (`/app/sintomas`)
**Registro de hoy 🌸** — "Toma solo 2 minutos completarlo."
| Campo | Control |
|---|---|
| Fecha | selector de fecha (por defecto hoy; permite fechas pasadas, no futuras) |
| Día del ciclo (opcional) | número 1–60, placeholder "Ej: 14" |
| Nivel de dolor pélvico (0 = sin dolor · 10 = insoportable) | 11 círculos seleccionables 0–10, color progresivo de lavanda claro a lavanda profundo (nunca rojo) |
| Estado de ánimo | chips selección única: 😊 Bien · 😐 Regular · 😔 Bajo · 😠 Irritable · 😰 Ansiosa · 😩 Agotada |
| Síntomas presentes hoy | chips selección múltiple: 😣 Dolor menstrual · 🤢 Náuseas · 😴 Fatiga · 🚽 Digestivo · 🩸 Sangrado · 🧠 Niebla mental · 💤 Insomnio |
| Notas adicionales | textarea "¿Algo relevante que quieras recordar? (medicación, actividad, estrés...)" |

Botón "💾 Guardar registro". Un registro por fecha (si ya existe, se edita). Toast de confirmación.

**Historial reciente 📋:** lista con fecha en bloque (día + mes), "Dolor: 6/10 · Ánimo: Regular", síntomas y notas. Filtro por mes, editar y eliminar.

**Mi mes** (valor agregado): gráfica de línea del dolor en el mes + conteo de síntomas más frecuentes, con opción "Descargar PDF para mi médica" (resumen descriptivo, sin interpretaciones clínicas).

`VideoSlot` tutorial. Privacidad: solo la dueña ve sus registros (RLS), ni siquiera las demás miembras.

### 7.4 Foro de la comunidad (`/app/foro`)
`PageHeader`: badge "💛 Comunidad", "No estás sola, *estamos contigo*", "Un espacio seguro para compartir, preguntar y encontrar fuerza en la experiencia de otras mujeres."

- **Escribe en el foro ✍️** (recuadro amarillo pastel punteado): textarea que crece (publicaciones cortas o largas, hasta 5000 caracteres), opción "Publicar como anónima", pegar enlace de YouTube → se muestra embebido. Botón "Publicar 🌸".
- **Publicaciones:** avatar emoji, nombre (o "Anónima"), tiempo relativo ("Hace 2 horas"), texto con "Leer más" si es largo, "💜 N reacciones" (una por usuaria, alterna), "💬 N respuestas" (hilo desplegable con respuestas).
- Orden: recientes / más apoyadas.
- Normas de la comunidad visibles (enlace fijo) y aceptación la primera vez.
- Botón "Reportar" en cada publicación/respuesta → cola de moderación admin.
- Filtro automático básico: si el texto contiene palabras de riesgo (lista configurable), mostrar a la autora el modal de ayuda urgente y marcar para revisión prioritaria del equipo.
- Aviso fijo: "Lo que se comparte aquí son experiencias personales, no recomendaciones médicas."
- Tiempo real con Supabase Realtime (nuevas publicaciones aparecen sin recargar).
- Los posts de la referencia (María C., Sofía R., Luciana M.) son ejemplo visual: NO cargarlos.

### 7.5 Diario terapéutico (`/app/diario`)
Dos modos en pestañas:
1. **Descargar e imprimir:** vista previa del PDF + botón "Descargar diario (PDF)". `TODO(cliente)`: PDF pendiente.
2. **Llenar en línea:** entradas privadas con fecha, preguntas guía del diario (se configuran en tabla `journal_prompts` cuando llegue el PDF), campo libre, emoción del día. Historial de entradas. Exportar mis entradas a PDF.
`VideoSlot` "Cómo usar tu diario".

### 7.6 Cartilla psicoeducativa (`/app/cartilla`)
Portada, descripción, recuadro amarillo "Sobre esta cartilla" (texto `TODO(cliente)`), visor del PDF embebido (con `react-pdf` o iframe) + botón "Descargar cartilla". Índice de capítulos si el PDF lo tiene. `VideoSlot` tutorial. `TODO(cliente)`: PDF pendiente.

### 7.7 Recursos descargables para tu bienestar (`/app/recursos`)
Índice con dos tarjetas grandes: 🧘 Yoga terapia · 🌬️ Mindfulness.

**Yoga terapia (`/app/recursos/yoga`)**
- Encabezado: "Yoga terapia para la endometriosis" · "Movimiento · Respiración · Bienestar" · frase "Tu cuerpo también merece calma".
- 4 beneficios con ícono: Relajación · Movilidad · Conexión corporal · Descanso.
- Botón "Descargar guía de posturas (PDF)" → `/pdf/yoga-terapia-endometriosis.pdf` (archivo entregado por el cliente).
- **8 posturas** en tarjetas (número, nombre, nombre en sánscrito, beneficio, duración) con ilustración recortada del PDF:
  1. Postura del niño (Balasana) — Relaja la espalda, la cadera y la mente. Ayuda a reducir la tensión en la zona pélvica y la ansiedad. · 1–3 min
  2. Gato – Vaca (Marjaryasana – Bitilasana) — Moviliza la columna, mejora la circulación y alivia la rigidez. · 1–2 min
  3. Perro boca abajo (Adho Mukha Svanasana) — Estira la espalda, activa la circulación y libera la tensión acumulada. · 1–2 min
  4. Postura de la mariposa (Baddha Konasana) — Abre la cadera, mejora la flexibilidad y calma el sistema nervioso. · 2–3 min
  5. Postura de la cobra (Bhujangasana) — Fortalece la espalda, alivia la rigidez y mejora la postura. · 30 s – 1 min
  6. Ángulo lateral extendido (Utthita Parsvakonasana) — Estira la zona lateral del cuerpo, abre el pecho y mejora la movilidad. · 1–2 min por lado
  7. Piernas arriba en la pared (Viparita Karani) — Reduce la inflamación, calma el sistema nervioso y alivia la pesadez en la pelvis. · 3–5 min
  8. Relajación final (Savasana) — Integra los beneficios de la práctica y ayuda a la recuperación del cuerpo y la mente. · 5 min
- Modo "Practicar conmigo": temporizador guiado que recorre las 8 posturas con su duración y un sonido suave al cambiar.
- **Videos** (6 `VideoEmbed`, tabla 5.2).
- Cierre: "Tu bienestar también es parte del tratamiento" · "Respira · Mueve · Conecta · Descansa".
- Aviso: "Consulta con tu médica antes de iniciar si estás en crisis de dolor o posoperatorio."

**Mindfulness (`/app/recursos/mindfulness`)**
- Encabezado: "Meditaciones mindfulness guiadas" · "Un espacio para respirar, conectar con el presente y regalarte unos minutos de calma."
- Botón "Descargar guía (PDF)" → `/pdf/meditaciones-mindfulness.pdf`.
- 4 `VideoEmbed` (tabla 5.2), numerados 01–04 con su descripción.
- Ejercicio interactivo de respiración: círculo animado (inhala 4 s · sostén 4 s · exhala 6 s), 3 minutos, respeta reduced-motion (versión con texto y conteo).
- Cierre: "✦ Respira • Conecta • Presente ✦".

---

## 8. BASE DE DATOS (Supabase / Postgres)

Todas las tablas con **RLS activado**. `auth.users` para autenticación.

```
profiles            id (=auth.uid) PK, nombre, avatar_emoji, rol ('miembra'|'admin'|'profesional'),
                    plan ('diagnostico'|'orienta'|'aprende'), plan_inicio date, activo bool, created_at
consents            id, user_id FK, tipo ('datos_sensibles'|'normas_foro'), version, aceptado_at
contact_messages    id, nombre, email, asunto, telefono, mensaje, estado ('nuevo'|'respondido'), created_at
professionals       id, nombre, cargo, anios_experiencia, especialidades text[], bio, foto_url, video_id, activo
appointment_requests id, user_id FK, professional_id FK null, telefono, modalidad, horario, motivo,
                    estado ('pendiente'|'confirmada'|'realizada'|'cancelada'), notas_equipo, created_at
podcast_episodes    id, titulo, descripcion, tipo ('especialista'|'testimonio'), media_tipo ('audio'|'video'|'youtube'),
                    storage_path, youtube_id, duracion_seg, portada_url, publicado_at, created_at
podcast_progress    user_id FK, episode_id FK, posicion_seg, completado bool — PK(user_id, episode_id)
symptom_logs        id, user_id FK, fecha date, dia_ciclo int null, dolor int 0-10, animo text,
                    sintomas text[], notas text, created_at, updated_at — UNIQUE(user_id, fecha)
forum_posts         id, user_id FK, contenido, anonima bool, youtube_id null, oculto bool, riesgo bool, created_at
forum_replies       id, post_id FK, user_id FK, contenido, anonima bool, oculto bool, created_at
forum_reactions     post_id FK, user_id FK — PK(post_id, user_id)
forum_reports       id, target_tipo ('post'|'reply'), target_id, user_id FK, motivo, resuelto bool, created_at
journal_prompts     id, orden, pregunta, activo
journal_entries     id, user_id FK, fecha, emocion, respuestas jsonb, texto_libre, created_at
resources           id, categoria ('yoga'|'mindfulness'|'cartilla'|'diario'), titulo, descripcion,
                    pdf_path, video_id, orden
site_videos         clave text PK (p.ej. 'inicio_validacion'), youtube_id null, storage_path null, poster_url
```

**Políticas RLS clave:**
- `symptom_logs`, `journal_entries`, `podcast_progress`, `consents`: la usuaria solo lee/escribe filas con `user_id = auth.uid()`. Admin no las lee salvo necesidad justificada (decisión del cliente, documentarla).
- `forum_*`: cualquier miembra activa lee (no ocultos); escribe solo lo propio; admin modera todo. Cuando `anonima = true`, la vista pública no expone `user_id` (usar una vista `forum_posts_public`).
- `contact_messages`: insert anónimo permitido (con rate limit en la Edge Function); lectura solo admin.
- `appointment_requests`: la usuaria lee las suyas; admin todas.
- Contenido (`podcast_episodes`, `resources`, `professionals`, `site_videos`): lectura miembras activas (site_videos y professionals también públicos); escritura solo admin.

**Storage buckets:** `podcasts` (privado, URL firmada), `resources` (privado), `videos` (privado para área de miembras / público para videos de la zona pública), `public-assets` (público).

**Edge Functions:** `notify-team` (trigger en insert de `contact_messages` y `appointment_requests` → correo Resend al equipo), `invite-member` (admin crea cuenta y envía invitación).

---

## 9. PANEL ADMIN (`/admin`, rol admin)

Interfaz sencilla (el equipo son estudiantes de psicología, no programadoras):
- **Miembras:** crear (nombre, correo, plan → envía invitación), activar/desactivar, cambiar plan.
- **Mensajes de contacto:** bandeja con estado nuevo/respondido.
- **Solicitudes de acompañamiento:** lista, cambiar estado, notas internas.
- **Podcasts:** subir/editar/programar/eliminar episodios (arrastrar y soltar, barra de progreso).
- **Profesionales:** CRUD con foto y video.
- **Recursos y PDFs:** reemplazar cartilla, diario, guías.
- **Videos del sitio:** una tabla con cada `VideoSlot` (clave, descripción, dónde aparece) para pegar el ID de YouTube o subir el archivo. Así el cliente llena "video en todo" sin tocar código.
- **Moderación del foro:** reportes, publicaciones marcadas con riesgo (arriba y resaltadas), ocultar/restaurar.

---

## 10. FASE 2 (NO construir ahora; dejar la arquitectura preparada)

Del documento de estructura original del cliente:

1. **Calendario:** ciclo menstrual, citas médicas (fecha, hora, especialidad), horarios de medicación, recordatorios (notificaciones push web / correo). Tablas futuras: `calendar_events`, `medications`, `reminders`.
2. **Gamificación "Mapa de niveles":** check-in diario de hábitos (respiración, registro de dolor, pauta antiinflamatoria) que suma puntos. Fases: **Calma y Brisa** (prevención; desbloquea infografías y meditaciones breves) · **Tormenta** (afrontamiento del dolor; despliega "Cofres de calma": audios de relajación, técnicas de distracción, acceso rápido a soporte) · **Renacer / Después de la lluvia** (fortalecimiento; evaluación mensual y redes de apoyo). Insignias de resiliencia y recompensas (descuentos en consultas, acceso prioritario a talleres). Escuchar Endo-Voces suma puntos. Visual: mapa 3D tipo isla/camino con clima cambiante (brisa → lluvia → arcoíris) hecho en R3F.
3. **Pagos en línea:** pasarela colombiana (Wompi, ePayco o Mercado Pago) → webhook crea la cuenta automáticamente.
4. **Mapa corporal de dolor multidimensional:** silueta 3D limpia y clínica, clicable por zonas (pelvis central, suelo pélvico, irradiación a pierna derecha, diafragma/hombro derecho) con raycasting; cualidad del dolor (punzante, cólico, quemazón, pesadez, "congelamiento" articular); mapa de calor mensual; botón "Exportar para mi ginecóloga" (PDF de 1 página). Las correlaciones se presentan como **resumen descriptivo** de los propios registros, nunca como diagnóstico, y solo con un mínimo de registros.

---

## 11. LEGAL, SEGURIDAD Y ÉTICA

- Datos de salud = datos sensibles (Ley 1581 de 2012, habeas data). Consentimiento explícito, política de tratamiento en `/privacidad` (`TODO(cliente)`: texto revisado por su asesor legal), derecho a descargar y borrar sus datos (botón en "Mi cuenta").
- Aviso permanente: el sitio es educativo y de acompañamiento, no reemplaza consulta médica ni atención de urgencias.
- Nada de claves ni secretos en el frontend (solo la `anon key` de Supabase; el resto en Edge Functions).
- Rate limiting en formularios públicos + honeypot.
- Videos de YouTube de terceros: se embeben (no se descargan ni se re-suben).
- Sin analítica invasiva; si se usa, Plausible o similar sin cookies de rastreo.

---

## 12. ORDEN DE TRABAJO Y ENTREGABLES

Entrega en este orden; al final de cada paso, muestra el resultado y la lista de pendientes.

1. **Base:** proyecto Vite + Tailwind con tokens, router, layout público (Navbar, Footer), componentes UI, `VideoEmbed` / `AmbientVideo` / `VideoSlot`, catálogo `videos.js`.
2. **Sistema 3D:** `SceneCanvas`, modelo procedural (opción B), `ButterflyField`, `useScrollStage`, `QualityGate`, póster de fallback.
3. **Inicio** completo con 3D y video.
4. **Programa** completo.
5. **Endometriosis** completo con las escenas 3D educativas por tipo.
6. **Contáctanos** + Supabase (tabla, Edge Function, correo).
7. **Auth:** `/ingresar`, recuperación, consentimiento, `ProtectedRoute`.
8. **Área de miembras:** layout + Inicio privado → Síntomas → Foro → Acompañamiento → Endo-Voces → Recursos (yoga, mindfulness) → Cartilla → Diario.
9. **Panel admin.**
10. **Migraciones SQL** completas con RLS + README (instalación, variables de entorno, cómo subir podcasts y videos, cómo crear miembras).
11. **Sustitución del modelo procedural por el GLB** cuando esté listo.

### Criterios de aceptación globales
- Lighthouse móvil: Performance ≥ 85, Accesibilidad ≥ 95.
- Funciona en Chrome, Safari iOS y Android de gama media; sin scroll horizontal en 360 px.
- Sin WebGL o con reduced-motion, todo el contenido sigue accesible.
- Ninguna miembra puede ver datos privados de otra (probar RLS con dos cuentas).
- Todos los textos marcados "tal cual" coinciden con este documento.
- Cero URLs de video inventadas; todo video faltante aparece como `VideoSlot`.

---

## 13. PENDIENTES DEL CLIENTE (mostrar como checklist al final de cada entrega)

- [ ] Logo en SVG o PNG sin fondo (horizontal y circular)
- [ ] QR de Instagram en alta resolución
- [ ] PDF del diario terapéutico
- [ ] PDF de la cartilla psicoeducativa + texto "Sobre esta cartilla"
- [ ] Datos, fotos y videos de las profesionales del equipo
- [ ] Correo que recibe los formularios
- [ ] Precios de los planes (o decidir no mostrarlos)
- [ ] Confirmar "Primera sesión gratuita" en acompañamiento
- [ ] Quién modera el foro y normas de la comunidad
- [ ] Líneas de ayuda en salud mental verificadas
- [ ] Política de tratamiento de datos revisada
- [ ] Videos para cada `VideoSlot` (ver tabla 5.3)
- [ ] Confirmar si se incluye la sección "Tus derechos"
- [ ] Modelo 3D en GLB (o aprobar el procedural como definitivo)
- [ ] Primer episodio de Endo-Voces
