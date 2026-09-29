export default {
  description:
    "EndoIntegral acompaña cuerpo, mente y hábitos diarios de mujeres con endometriosis, con educación clara, contención emocional y un programa guiado paso a paso.",
  benefits: [
    {
      icon: "BookOpen",
      title: "Educación clara",
      text: "Información médica accesible, sin tecnicismos.",
      to: "/endometriosis",
    },
    {
      icon: "Flower2",
      title: "Bienestar diario",
      text: "Hábitos y check-ins que se adaptan a tus días.",
      to: "/programa",
    },
    {
      icon: "Route",
      title: "Mapa de niveles",
      text: "Progresa por fases: Calma, Tormenta y Renacer.",
      soon: true,
    },
    {
      icon: "Headphones",
      title: "Endo-Voces",
      text: "Un podcast para acompañarte en tus días de fatiga.",
      to: "/ingresar",
      locked: true,
    },
  ],
  modules: [
    {
      id: "endo-voces",
      name: "Endo-Voces",
      icon: "Headphones",
      text: "Escucha, descansa, conecta.",
    },
    {
      id: "acompanamiento",
      name: "Acompañamiento emocional",
      icon: "HeartHandshake",
      text: "Apoyo profesional a tu ritmo.",
    },
    {
      id: "sintomas",
      name: "Registro de síntomas",
      icon: "ClipboardList",
      text: "Escucha lo que tu cuerpo dice.",
    },
    {
      id: "foro",
      name: "Foro de la comunidad",
      icon: "MessagesSquare",
      text: "Un espacio para compartir.",
    },
    {
      id: "diario",
      name: "Diario terapéutico",
      icon: "NotebookPen",
      text: "Dale un lugar a lo que sientes.",
    },
    {
      id: "cartilla",
      name: "Cartilla psicoeducativa",
      icon: "BookOpen",
      text: "Herramientas para comprenderte.",
    },
    {
      id: "recursos",
      name: "Recursos para tu bienestar",
      icon: "Sprout",
      text: "Yoga, mindfulness y calma.",
    },
  ],
};
