export default {
  about:
    "EndoIntegral es una iniciativa de servicios de salud orientada a la atención integral de mujeres con endometriosis. El modelo articula atención clínica, salud mental, nutrición, educación para el autocuidado, acompañamiento psicosocial y herramientas digitales dentro de una ruta coordinada de atención. Su estructura empresarial busca responder a las necesidades físicas y emocionales asociadas con la enfermedad, reducir la fragmentación de los servicios y desarrollar una operación sostenible mediante diferentes fuentes de ingresos, alianzas estratégicas y servicios presenciales y digitales.",
  reason:
    "EndoIntegral nace ante la necesidad de ofrecer una atención más completa a las mujeres con endometriosis. La enfermedad puede afectar de manera simultánea la salud física, el bienestar emocional, las relaciones sociales, la vida académica o laboral y la calidad de vida. A esto se suman dificultades como el retraso diagnóstico, la normalización del dolor, la desinformación y la falta de acompañamiento psicológico e interdisciplinario.\n\nLa empresa se crea para integrar en una misma ruta de atención los servicios que con frecuencia se reciben de forma aislada. El propósito es que cada paciente pueda acceder a orientación especializada, seguimiento clínico, apoyo psicológico, educación, autocuidado y redes de apoyo de manera coordinada, continua y centrada en sus necesidades.",
  mission:
    "Brindar atención integral y especializada a mujeres con endometriosis mediante un modelo interdisciplinario que articula atención clínica, salud mental, educación y herramientas digitales, promoviendo el autocuidado, el bienestar emocional y una mejor calidad de vida.",
  vision:
    "Ser una IPS líder y referente en Colombia en la atención integral de la endometriosis, reconocida por su excelencia clínica, enfoque interdisciplinario, innovación digital y modelo de atención humanizado, contribuyendo de manera sostenible al bienestar y la calidad de vida de las mujeres con esta enfermedad.",
  values: [
    {
      name: "Empatía",
      text: "Comprendemos y validamos la experiencia de cada paciente, ofreciendo un trato respetuoso, cercano y humanizado.",
    },
    {
      name: "Rigor científico",
      text: "Orientamos las intervenciones y contenidos a partir de conocimiento científico, evidencia disponible y ejercicio profesional responsable.",
    },
    {
      name: "Integralidad",
      text: "Comprendemos la salud de la paciente desde sus dimensiones física, psicológica y social, procurando una atención coordinada.",
    },
    {
      name: "Respeto",
      text: "Reconocemos la dignidad, privacidad, autonomía, decisiones y particularidades de cada mujer.",
    },
    {
      name: "Innovación",
      text: "Incorporamos herramientas tecnológicas y estrategias de atención que facilitan el acceso, el seguimiento y la educación en salud.",
    },
    {
      name: "Trabajo interdisciplinario",
      text: "Promovemos la colaboración entre profesionales para ofrecer una atención organizada, coherente y centrada en la paciente.",
    },
  ],
  // Planes 1, 2 y 3 según «PDA 2da entrega». Tarifas del Canvas social (aporte por participante o paciente).
  plans: [
    {
      id: "aprende",
      number: 1,
      name: "Aprende",
      tagline: "Educación, sensibilización y autocuidado",
      weeks: 4,
      price: "$220.000",
      priceNote: "COP por participante",
      audience:
        "mujeres con dudas, síntomas, diagnóstico de endometriosis o interés en conocer más sobre la enfermedad. También familiares, parejas, cuidadores y comunidad en general.",
      objective:
        "Brindar psicoeducación sobre endometriosis, salud mental y autocuidado, respondiendo a necesidades de información y favoreciendo una mayor comprensión del impacto físico, emocional y social de la enfermedad.",
      lead: "Psicología y educación en salud",
      includes: [
        "Cartillas psicoeducativas sobre endometriosis, síntomas, salud mental, autocuidado y afrontamiento.",
        "Charlas educativas para informar y sensibilizar sobre la endometriosis y la importancia de buscar atención oportuna.",
        "Folletos informativos sobre signos, síntomas, mitos, autocuidado y rutas de orientación.",
        "Talleres para familias y parejas que fortalecen la comprensión y las redes de apoyo.",
        "Diario de bienestar para registrar emociones, síntomas, pensamientos y hábitos.",
        "Cartilla de autocuidado con herramientas prácticas para el día a día.",
      ],
      team: [],
      route: [
        "Psicoeducar",
        "Sensibilizar",
        "Orientar",
        "Fortalecer el autocuidado",
        "Identificar cuándo buscar atención profesional",
      ],
      schedule: [],
    },
    {
      id: "orienta",
      number: 2,
      name: "Orienta",
      tagline: "Detección y diagnóstico con acompañamiento interdisciplinario",
      weeks: 8,
      price: "$1.550.000",
      priceNote: "COP por paciente",
      audience:
        "mujeres con síntomas compatibles o sospecha de endometriosis que aún no cuentan con un diagnóstico confirmado.",
      objective:
        "Detectar oportunamente posibles casos de endometriosis, realizar la valoración diagnóstica correspondiente y orientar integralmente a la paciente mediante un equipo interdisciplinario, identificando necesidades físicas, nutricionales y emocionales.",
      lead: "Ginecología, con apoyo interdisciplinario",
      includes: [
        "Entrevista inicial centrada en síntomas, impacto emocional y necesidades.",
        "Tamizaje psicológico para detectar señales de riesgo emocional.",
        "Talleres de educación sobre endometriosis, dolor, ansiedad, estrés y bienestar.",
        "Cartilla digital de autocuidado y afrontamiento.",
        "Regulación emocional, diario terapéutico y respiración consciente.",
        "Mindfulness, yoga y pilates.",
        "Taller de autocuidado y bienestar.",
        "Grupo de apoyo y orientación sobre redes de apoyo.",
        "Seguimiento y cierre con recomendaciones de continuidad.",
      ],
      team: [
        [
          "Ginecología",
          "Valoración clínica especializada, ayudas diagnósticas e integración de resultados para establecer el diagnóstico y la conducta terapéutica.",
        ],
        [
          "Fisioterapia",
          "Evalúa dolor pélvico, movilidad, postura y piso pélvico; orienta ejercicios, respiración y relajación.",
        ],
        [
          "Nutrición",
          "Evalúa hábitos alimentarios y estado nutricional; brinda recomendaciones individualizadas.",
        ],
        [
          "Psicología",
          "Evalúa el impacto emocional del proceso diagnóstico y brinda psicoeducación y regulación emocional.",
        ],
        [
          "Psiquiatría",
          "Interconsulta cuando se identifican síntomas emocionales de mayor complejidad.",
        ],
      ],
      note: "Si se requieren estudios con equipos no disponibles en la sede (ecografías especializadas, mapeo de endometriosis, resonancia u otros), te articulamos con tu EPS o la red diagnóstica. EndoIntegral mantiene el seguimiento y los resultados regresan al equipo para su interpretación.",
      route: [
        "Ingreso a EndoIntegral",
        "Valoración ginecológica e interdisciplinaria",
        "Estudios externos si se requieren",
        "Resultados",
        "Diagnóstico y orientación",
        "Continuidad en EndoIntegral",
      ],
      schedule: [
        [
          "Entrevista semiestructurada con todos los profesionales",
          "Explorar síntomas, impacto emocional y necesidades.",
        ],
        [
          "Tamizaje psicológico",
          "Identificar señales de ansiedad, depresión, estrés y bienestar.",
        ],
        [
          "Taller psicoeducativo + cartilla",
          "Brindar información clara y reducir desinformación.",
        ],
        [
          "Regulación emocional + diario",
          "Desarrollar recursos de afrontamiento.",
        ],
        [
          "Mindfulness + respiración consciente",
          "Entrenar técnicas de relajación y manejo del estrés.",
        ],
        [
          "Yoga suave, autocuidado y pilates",
          "Favorecer el bienestar físico y emocional.",
        ],
        [
          "Grupo de apoyo",
          "Fortalecer el apoyo social y compartir estrategias.",
        ],
        [
          "Seguimiento + orientación de continuidad",
          "Revisar cambios y orientar próximos pasos profesionales.",
        ],
      ],
    },
    {
      id: "diagnostico",
      number: 3,
      name: "Diagnosticadas",
      tagline: "Seguimiento integral con prioridad en salud mental",
      weeks: 10,
      price: "$2.200.000",
      priceNote: "COP por paciente",
      audience:
        "mujeres con diagnóstico confirmado de endometriosis que requieren acompañamiento durante el tratamiento y seguimiento de su bienestar físico y emocional.",
      objective:
        "Brindar seguimiento integral a mujeres diagnosticadas con endometriosis, priorizando el acompañamiento psicológico, el fortalecimiento de estrategias de afrontamiento, el autocuidado, la adherencia al tratamiento y la calidad de vida mediante un equipo interdisciplinario.",
      lead: "Psicología como eje principal, con seguimiento interdisciplinario",
      includes: [
        "Taller introductorio sobre endometriosis y mitos frecuentes.",
        "Psicoeducación sobre dolor crónico, ansiedad, depresión, estrés y bienestar.",
        "Cartilla educativa digital.",
        "Taller práctico de regulación emocional.",
        "Sesión de mindfulness y respiración consciente.",
        "Sesión de movimiento/yoga suave orientada al bienestar.",
        "Taller de autocuidado y hábitos saludables.",
        "Espacio de sensibilización para familiares, parejas, amigos o cuidadores.",
        "Materiales digitales de continuidad.",
      ],
      team: [
        [
          "Psicología · eje principal",
          "Valoración y seguimiento emocional; intervención psicológica, regulación emocional, afrontamiento y redes de apoyo.",
        ],
        [
          "Ginecología",
          "Seguimiento clínico, evolución de síntomas, respuesta al tratamiento y ajustes de la conducta terapéutica.",
        ],
        [
          "Fisioterapia",
          "Dolor pélvico, tensión muscular, movilidad y piso pélvico; movimiento terapéutico, respiración y relajación.",
        ],
        [
          "Nutrición",
          "Seguimiento del estado nutricional y hábitos alimentarios durante el tratamiento.",
        ],
        [
          "Psiquiatría",
          "Valoración especializada y, cuando corresponda, tratamiento y seguimiento.",
        ],
      ],
      route: [
        "Ingreso al plan",
        "Valoración psicológica prioritaria",
        "Plan individual",
        "Intervención psicológica",
        "Seguimiento interdisciplinario",
        "Evaluación de avances",
        "Plan de continuidad",
      ],
      schedule: [
        [
          "Valoración inicial",
          "Conocer tu experiencia y definir necesidades terapéuticas.",
        ],
        [
          "Evaluación emocional",
          "Identificar señales de ansiedad, depresión, estrés y afectación del bienestar.",
        ],
        [
          "Psicoeducación",
          "Comprender la relación entre endometriosis, dolor crónico y salud mental.",
        ],
        [
          "Regulación emocional",
          "Reconocer y manejar emociones relacionadas con la enfermedad.",
        ],
        [
          "Afrontamiento del dolor y estrés",
          "Desarrollar recursos para momentos de crisis o aumento del dolor.",
        ],
        [
          "Autocuidado y relación con el cuerpo",
          "Fortalecer el autocuidado y una relación más saludable con el cuerpo.",
        ],
        [
          "Autoestima e identidad",
          "Evitar que la enfermedad defina por completo tu identidad.",
        ],
        [
          "Redes de apoyo y comunicación",
          "Fortalecer el apoyo social y la expresión de necesidades.",
        ],
        [
          "Familia, pareja y sexualidad",
          "Abordar repercusiones relacionales y afectivas.",
        ],
        [
          "Evaluación y continuidad",
          "Valorar avances y establecer un plan de seguimiento.",
        ],
      ],
    },
  ],
};
