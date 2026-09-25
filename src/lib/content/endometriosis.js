// Textos tomados del documento de la clienta («página web.pdf»). Síntomas, tratamientos y
// salud mental se copian tal como aparecen en sus imágenes de ejemplo.
export const definition = 'La endometriosis es una patología ginecológica crónica, inflamatoria y altamente prevalente que afecta a mujeres en edad reproductiva. Según la 11° Clasificación Internacional de Enfermedades (CIE-11) de la Organización Mundial de la Salud (OMS), se define como una enfermedad del útero caracterizada por la presencia y crecimiento de tejido endometrial fuera de la cavidad uterina (como en los ovarios, los ligamentos útero-sacros, las trompas de Falopio, la vagina o el recto). Este tejido ectópico no puede ser expulsado correctamente, lo que genera reacciones inflamatorias crónicas, tejido cicatrizal, hemorragias internas y lesiones o adherencias en la pelvis.';
export const symptoms = [
  ['Frown','Dolor pélvico','Dolor crónico o durante la menstruación que no cede con analgésicos.'],
  ['Droplets','Menstruación dolorosa','Dismenorrea intensa que interfiere con actividades diarias.'],
  ['BatteryLow','Fatiga','Cansancio persistente que no mejora con el descanso.'],
  ['Baby','Infertilidad','Dificultad para concebir en algunos casos.'],
  ['Waves','Malestar intestinal','Dolor al defecar, diarrea o estreñimiento especialmente menstrual.'],
  ['Heart','Dolor durante relaciones','Dispareunia: dolor durante o después del sexo.'],
  ['CloudSun','Cambios en el ánimo','Ansiedad, depresión y afectación de la calidad de vida.'],
  ['Wind','Náuseas','Especialmente durante el período menstrual.'],
];
// id = vista del modelo 3D (designModel.js → MODE_TYPE)
export const forms = [
  { id:'superficial', name:'Tipo I', title:'Tipo I – Peritoneal superficial', text:'Implantes superficiales en el peritoneo y ovarios, generalmente aislados y sin adherencias importantes.', scene:'En el modelo: focos pequeños y aislados sobre la superficie del útero y los ovarios.' },
  { id:'ovarica', name:'Tipo II', title:'Tipo II – Ovárica', text:'Presencia de endometriomas, quistes con contenido marrón oscuro, que pueden generar adherencias.', scene:'En el modelo: el ovario se vuelve translúcido y deja ver un endometrioma en su interior.' },
  { id:'profunda', name:'Tipo III', title:'Tipo III – Profunda', text:'Infiltración de más de 5 mm en el peritoneo; puede comprometer intestino, vejiga y uréteres.', scene:'En el modelo: aparecen la vejiga y el recto, y los focos se extienden hacia ellos.' },
  { id:'adherencias', name:'Tipo IV', title:'Tipo IV – Severa', text:'Diseminación extensa con implantes superficiales y profundos y adherencias complejas.', scene:'En el modelo: todos los focos y las adherencias que unen los órganos entre sí.' },
];
// [icono, título, texto, acento]
export const treatments = [
  ['Pill','Manejo farmacológico','Anticonceptivos hormonales, progestágenos, análogos de la GnRH y analgésicos para controlar síntomas.','rose'],
  ['Microscope','Cirugía laparoscópica','Intervención mínimamente invasiva para eliminar los focos de endometriosis y mejorar la calidad de vida.','lavender'],
  ['Sprout','Tratamiento complementario','Fisioterapia pélvica, nutrición antiinflamatoria, mindfulness y ejercicio adaptado.','yellow'],
  ['HeartHandshake','Apoyo psicológico','Fundamental para manejar el impacto emocional de vivir con una enfermedad crónica.','deep'],
];
export const mentalHealthIntro = 'La endometriosis como una condición con importantes implicaciones psicológicas. Se describen ansiedad, depresión y estrés como problemas observados con frecuencia, relacionados con factores como dolor crónico, incertidumbre diagnóstica, infertilidad, intervenciones quirúrgicas, estigma, aislamiento y dificultades en el acceso a atención.';
// [icono, título, texto, acento]
export const mentalHealth = [
  ['CloudRain','Depresión','Las mujeres con endometriosis tienen hasta el doble de probabilidad de desarrollar depresión, relacionada con el dolor crónico y las limitaciones cotidianas.','lavender'],
  ['Wind','Ansiedad','La anticipación del dolor y la incertidumbre sobre el futuro generan altos niveles de ansiedad.','rose'],
  ['UsersRound','Relaciones sociales','El dolor puede limitar la participación social, provocando aislamiento y deterioro de relaciones.','yellow'],
  ['Heart','Vida íntima y de pareja','El dolor durante las relaciones y el impacto en la fertilidad pueden generar conflictos y baja autoestima.','rose'],
  ['BriefcaseBusiness','Trabajo y estudios','El absentismo laboral y la incomprensión del entorno generan estrés adicional significativo.','deep'],
  ['Flower2','Imagen corporal','Los cambios físicos y los efectos de los tratamientos hormonales pueden afectar la percepción del propio cuerpo.','lavender'],
];
export const prevention = {
  promote: [
    ['Brain','Salud mental y bienestar integral','Promover espacios de apoyo emocional, autonomía y el desarrollo de recursos internos en las pacientes.'],
    ['HeartHandshake','Atención interdisciplinaria y humanizada','Fomentar una ruta coordinada que integre la ginecología, la psicología, la nutrición y el autocuidado.'],
    ['BookOpen','Educación y validación','Divulgar información confiable sobre la enfermedad, validando el dolor de las pacientes para combatir la desinformación y el estigma social.'],
  ],
  mitigate: 'Para mitigar el impacto emocional y psicológico, se busca disminuir los síntomas de ansiedad, depresión, estrés crónico, baja autoestima y los altibajos hormonales derivados de la enfermedad. Asimismo, para abordar el sufrimiento y la normalización del dolor, es fundamental reducir la minimización cultural del dolor menstrual y el aislamiento emocional mediante el fortalecimiento de redes de apoyo y talleres de regulación emocional. Finalmente, frente a la fragmentación de los servicios, se pretende disminuir la desolación, la incertidumbre y las barreras de acceso a una atención oportuna.',
  prevent: 'Para prevenir los trastornos mentales, se busca evitar el desarrollo de patologías asociadas a través de la detección temprana mediante tamizajes psicológicos y procesos psicoeducativos orientados al afrontamiento. Asimismo, frente a las consecuencias del diagnóstico tardío, se pretende prevenir y mitigar el riesgo de infertilidad y las secuelas relacionales y sociales por medio de una intervención oportuna.',
};
export const sources = {
  who:'https://www.who.int/es/news-room/fact-sheets/detail/endometriosis',
  eshre:'https://www.eshre.eu/Guidelines-and-Legal/Guidelines/Endometriosis-Guideline',
  labor:'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676',
  policy:'https://www.minsalud.gov.co/Normatividad_Nuevo/Resolucion%20No%202068%20de%202025.pdf',
};
