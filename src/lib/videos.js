// Videos de las guías «Yoga_Terapia_Endometriosis_Posturas_y_Videos.pdf» y
// «Meditaciones_Mindfulness_Guiadas_CLICABLE-2.pdf» (docs/). Títulos y textos tomados de los PDF.
export const videos = {
  yoga1: { id: 'gx4bJ9bIHWk', kind: 'yoga', title: 'Yoga para aliviar síntomas de endometriosis', channel: 'YogaconSil · Práctica suave y gentil' },
  yoga2: { id: 'gnyOCJHvl3Y', kind: 'yoga', title: '¿Tienes endometriosis? Realiza esta postura o la clase completa', channel: 'Atmaniyoga' },
  yoga3: { id: 'dCu3CkytAc8', kind: 'yoga', title: 'Yoga para la endometriosis y para el dolor pélvico', channel: 'La Cabaña del Bienestar · Narrativas de Calma' },
  yoga4: { id: 'CoPLA9usFoI', kind: 'yoga', title: 'Mini práctica de yoga para aliviar el dolor menstrual y la endometriosis', channel: 'Susana C. · 12 posturas suaves' },
  dolor: { id: 'Wa-1Z0jpspI', kind: 'meditacion', title: 'Meditación guiada para aliviar el dolor en 5 minutos', channel: 'Meditación guiada para acompañar un momento de relajación y atención plena.' },
  calma: { id: '_lOpSbsm9y4', kind: 'meditacion', title: '5 minutos mágicos para calmar el sistema nervioso', channel: 'Una práctica breve de meditación guiada enfocada en la calma.' },
  mindfulness: { id: '9-IOMXpv7Ys', kind: 'meditacion', title: 'Meditación guiada mindfulness de 10 minutos', channel: 'Práctica de mindfulness para favorecer la atención plena y la relajación.' },
  presente: { id: 'Q94RfVNboDI', kind: 'meditacion', title: 'Meditación guiada mindfulness: paz interior y atención plena', channel: 'Clase completa para practicar mindfulness y conectar con el presente.' },
};
export const yogaVideos = ['yoga1','yoga2','yoga3','yoga4','dolor','calma'];
export const mindfulnessVideos = ['dolor','calma','mindfulness','presente'];
// TODO(cliente): videos originales del equipo. Los ID no se inventan.
export const siteVideoSlots = {
  inicio_validacion: 'Tu dolor merece ser escuchado', programa_institucional: 'Conoce al equipo EndoIntegral',
  plan_diagnostico: 'Conoce el plan Diagnóstico', plan_orienta: 'Conoce el plan Orienta', plan_aprende: 'Conoce el plan Aprende',
  endometriosis_definicion: 'Comprender la endometriosis', endometriosis_mental: 'Cuidar también tu salud mental', endometriosis_tratamiento: 'Opciones de tratamiento',
  contacto_saludo: 'Estamos aquí para escucharte', miembros_bienvenida: 'Bienvenida a tu espacio', sintomas_tutorial: 'Cómo registrar tus síntomas', diario_tutorial: 'Cómo usar tu diario', cartilla_tutorial: 'Recorre tu cartilla',
};
export function youtubeId(url) { try { const u = new URL(url); const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname) ? u.searchParams.get('v') : null; return /^[\w-]{11}$/.test(id || '') ? id : null; } catch { return null; } }
