// Módulos del área privada incluidos en cada plan, según «PDA 2da entrega» (planes 1, 2 y 3).
// Debe coincidir con public.plan_allows() en supabase/migrations/202610060010_free_plan_signup.sql,
// que es la que realmente protege los datos. 'ninguno' es la cuenta gratuita, sin módulos.
export const planNames = { ninguno: 'Sin plan', aprende: 'Aprende', orienta: 'Orienta', diagnostico: 'Diagnosticadas' };
// Nombre completo con su número, como aparece en el programa.
export const planLabels = { ninguno: 'Cuenta gratuita', aprende: 'Plan 1 · Aprende', orienta: 'Plan 2 · Orienta', diagnostico: 'Plan 3 · Diagnosticadas' };
export const paidPlans = ['aprende', 'orienta', 'diagnostico'];
const ALL = ['endo-voces', 'acompanamiento', 'sintomas', 'foro', 'diario', 'cartilla', 'recursos'];
export const planModules = {
  ninguno: [],
  aprende: ['endo-voces', 'cartilla', 'diario'],
  orienta: ALL,
  diagnostico: ALL,
};
export const hasPlan = (profile) => paidPlans.includes(profile?.plan);
export function canAccess(profile, moduleId) {
  if (!profile?.activo) return false;
  if (profile.rol === 'admin') return true;
  return (planModules[profile.plan] || []).includes(moduleId);
}
// Planes que incluyen un módulo, para mostrarlos cuando está bloqueado.
export const plansWith = (moduleId) => paidPlans.filter(p => planModules[p].includes(moduleId)).map(p => planLabels[p]);

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
