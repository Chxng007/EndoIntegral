// Guías paso a paso que reemplazan los videos tutoriales. La clave coincide con la del espacio
// de video (site_videos.clave): si el equipo llega a cargar un video desde el panel, se muestra
// encima de la guía.
export const guias = {
  // Tu espacio · Inicio
  miembros_bienvenida: {
    icon: "Flower2",
    title: "Cómo usar tu espacio",
    intro: "Todo lo que necesitas está a un clic. Así puedes empezar:",
    steps: [
      ["Explora tus módulos", "En el menú de la izquierda (o arriba, en el celular) están los espacios que incluye tu plan."],
      ["Empieza por lo que necesitas hoy", "No hay un orden obligatorio: registra cómo te sientes, escribe en tu diario o escucha Endo-Voces."],
      ["Vuelve cuando quieras", "Tus registros se guardan solo para ti y puedes retomarlos desde cualquier dispositivo."],
      ["Configura tu cuenta", "En «Mi cuenta» cambias el nombre con el que te saludamos y tu contraseña."],
      ["Pide ayuda si la necesitas", "El botón «Necesito ayuda ahora» siempre está visible, en cualquier pantalla."],
    ],
  },
  // Registro de síntomas
  sintomas_tutorial: {
    icon: "ClipboardList",
    title: "Cómo registrar tus síntomas",
    intro: "Toma unos dos minutos al día. Con el tiempo te ayuda a ver patrones y llevarlos a tu consulta.",
    steps: [
      ["Elige la fecha", "Por defecto es hoy. Si olvidaste un día, puedes elegir una fecha anterior; si ya existía un registro, se carga para editarlo."],
      ["Indica el día de tu ciclo", "Es opcional, pero ayuda a relacionar tus síntomas con el ciclo menstrual."],
      ["Marca tu nivel de dolor", "Usa la escala de 0 (sin dolor) a 10 (insoportable)."],
      ["Cuenta cómo está tu ánimo", "Elige la emoción que más se parece a tu día y marca los síntomas presentes."],
      ["Agrega notas y guarda", "Anota medicación, actividad o estrés que quieras recordar y presiona «Guardar registro»."],
      ["Revisa tu historial", "Filtra por mes para ver la gráfica y usa «Exportar a PDF» (elige «Guardar como PDF») para llevarlo a tu cita."],
    ],
    tip: "Si registras un dolor alto, te sugeriremos una meditación breve. Ante un dolor intenso o inusual, busca atención médica.",
  },
  // Diario terapéutico
  diario_tutorial: {
    icon: "NotebookPen",
    title: "Cómo usar tu diario",
    intro: "Tu diario es un lugar privado para lo que sientes. Puedes usarlo en línea o en papel.",
    steps: [
      ["Elige cómo escribir", "«Llenar en línea» guarda tus entradas aquí; «Descargar e imprimir» te da el diario EndoIntegral para llenarlo a mano."],
      ["Ponle nombre a tu emoción", "Elige la emoción del día. No hay respuestas correctas."],
      ["Responde las preguntas guía", "Escribe a tu ritmo; puedes dejar en blanco las que no quieras responder."],
      ["Usa tu espacio libre", "Escribe lo que necesites expresar, sin reglas."],
      ["Guarda tu entrada", "Presiona «Guardar en mi diario». Solo tú puedes verla."],
      ["Relee y exporta", "Tus entradas quedan abajo, por fecha. Puedes eliminarlas o exportarlas a PDF."],
    ],
    tip: "Si prefieres el papel, descarga el diario, imprímelo y decóralo con los stickers de las últimas páginas.",
  },
  // Cartilla psicoeducativa
  cartilla_tutorial: {
    icon: "BookOpen",
    title: "Cómo recorrer tu cartilla",
    intro: "La cartilla te acompaña con información clara sobre la endometriosis y tu bienestar emocional.",
    steps: [
      ["Pasa las páginas", "Usa las flechas a los lados de la página o las flechas ← → de tu teclado."],
      ["Salta a un tema", "Toca una miniatura de la fila de abajo para ir directo a esa página."],
      ["Amplía para leer con calma", "Toca la página para verla en pantalla completa con todo el detalle."],
      ["Llévala contigo", "Usa «Descargar PDF» para guardarla en tu celular o «Abrir para imprimir» si la quieres en papel."],
      ["Conversa lo que aprendes", "Comparte con tu red de apoyo lo que te resuene y llévalo a tus sesiones."],
    ],
  },
  // Inicio (sitio público)
  inicio_validacion: {
    icon: "Route",
    title: "Tu primer paso en EndoIntegral",
    intro: "Empezar es más sencillo de lo que parece:",
    steps: [
      ["Infórmate", "En «Hablemos de endometriosis» encuentras información clara y sin tecnicismos."],
      ["Conoce los planes", "Revisa los planes Aprende, Orienta y Diagnosticadas y elige el que acompaña tu momento."],
      ["Crea tu cuenta gratis", "Desde «Mi cuenta → Crear cuenta gratis». Solo necesitas tu nombre, correo y una contraseña."],
      ["Solicita tu plan", "Envía la solicitud con tu celular; el equipo te escribe para coordinar tu inscripción."],
    ],
  },
  // Programa (sitio público): las seis fases del programa, según «PDA 2da entrega».
  programa_institucional: {
    icon: "HeartHandshake",
    title: "Cómo funciona el programa",
    intro: "EndoIntegral se desarrolla en seis fases, con un equipo interdisciplinario que te acompaña en cada una:",
    steps: [
      ["Captación", "Conoces el programa, sus objetivos, metodología y beneficios, y eliges tu plan."],
      ["Evaluación inicial", "Entrevista individual y tamizaje psicológico para conocer tu experiencia y necesidades."],
      ["Inmersión psicoeducativa", "Talleres y cartilla para comprender la relación entre endometriosis, dolor y salud mental."],
      ["Recursos internos", "Regulación emocional, diario terapéutico, mindfulness, respiración consciente y yoga terapéutico."],
      ["Redes de apoyo", "Grupos de apoyo entre mujeres y talleres de sensibilización para familias y parejas."],
      ["Seguimiento y evaluación", "Revisamos tus avances y definimos contigo un plan de continuidad."],
    ],
  },
  // Contáctanos (sitio público)
  contacto_saludo: {
    icon: "MessagesSquare",
    title: "Qué pasa después de escribirnos",
    intro: "Tu mensaje llega directamente al equipo de EndoIntegral.",
    steps: [
      ["Recibimos tu mensaje", "Llega al correo del equipo con los datos que nos dejaste."],
      ["Lo revisamos con cuidado", "Una persona del equipo lee tu mensaje y prepara la respuesta."],
      ["Te contactamos", "Te respondemos por correo o, si dejaste tu celular, por WhatsApp."],
      ["Si pediste un plan", "Coordinamos el pago contigo y, una vez confirmado, lo activamos en tu cuenta y te avisamos por correo."],
    ],
    tip: "Si estás en una situación de urgencia, no esperes nuestra respuesta: llama al 123.",
  },
  // Hablemos de endometriosis (sitio público)
  endometriosis_mental: {
    icon: "Brain",
    title: "Cuidar también tu salud mental",
    intro: "Algunos pasos que pueden ayudarte a acompañar lo que sientes:",
    steps: [
      ["Reconoce lo que sientes", "Ansiedad, estrés, tristeza o frustración pueden aparecer. Nombrarlos es el primer paso."],
      ["Valida tu experiencia", "Tu dolor es real. Sentir cansancio o miedo no es debilidad."],
      ["Registra tus días", "Anotar síntomas y emociones te ayuda a identificar patrones y a explicarlos en consulta."],
      ["Apóyate en tu red", "Habla con personas de confianza o busca un grupo de apoyo."],
      ["Busca acompañamiento profesional", "Si las emociones afectan tu día a día, consulta con psicología; no tienes que hacerlo sola."],
    ],
  },
};
