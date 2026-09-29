// Módulos del área privada incluidos en cada plan, según «página web.pdf».
// Debe coincidir con public.plan_allows() en supabase/migrations/202609250004_plan_access.sql,
// que es la que realmente protege los datos.
export const planNames = { diagnostico: 'Diagnóstico', orienta: 'Orienta', aprende: 'Aprende' };
const ALL = ['endo-voces', 'acompanamiento', 'sintomas', 'foro', 'diario', 'cartilla', 'recursos'];
export const planModules = {
  diagnostico: ALL,
  orienta: ALL,
  aprende: ['endo-voces', 'cartilla', 'recursos'],
};
export function canAccess(profile, moduleId) {
  if (!profile?.activo) return false;
  if (profile.rol === 'admin') return true;
  return (planModules[profile.plan] || []).includes(moduleId);
}
// Planes que incluyen un módulo, para mostrarlos cuando está bloqueado.
export const plansWith = (moduleId) => Object.keys(planModules).filter(p => planModules[p].includes(moduleId)).map(p => planNames[p]);

// Roles: el equipo (hasta MAX_ADMINS personas) comparte las mismas funciones;
// las usuarias ven solo los módulos de su plan. El límite también se valida en la base de datos.
export const MAX_ADMINS = 6;
export const roleNames = { admin: 'Administradora', miembra: 'Usuaria' };
export const isAdmin = (profile) => Boolean(profile?.activo && profile.rol === 'admin');
export const firstName = (profile) => profile?.nombre?.trim().split(/\s+/)[0] || '';
// Secciones del panel del equipo (también se muestran en la barra lateral de las administradoras).
export const adminSections = [
  ['', 'Resumen'],
  ['miembras', 'Usuarias y equipo'],
  ['mensajes', 'Mensajes'],
  ['solicitudes', 'Solicitudes'],
  ['podcasts', 'Podcasts'],
  ['profesionales', 'Profesionales'],
  ['recursos', 'Recursos'],
  ['videos', 'Videos'],
  ['foro', 'Moderación'],
];
