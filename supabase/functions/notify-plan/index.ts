import { z } from 'npm:zod@4';
import { authenticated,json,preflight } from '../_shared/http.ts';
import { capitalize,escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// Una administradora activó o cambió el plan de una usuaria: se le avisa por correo con el enlace de ingreso.
const schema=z.object({user_id:z.uuid()});
const plans:Record<string,{name:string,text:string}>={
 aprende:{name:'Plan 1 · Aprende',text:'Endo-Voces, la cartilla psicoeducativa y tu diario de bienestar.'},
 orienta:{name:'Plan 2 · Orienta',text:'todos los espacios: acompañamiento emocional, registro de síntomas, foro, diario, cartilla, recursos y Endo-Voces.'},
 diagnostico:{name:'Plan 3 · Diagnosticadas',text:'todos los espacios: acompañamiento emocional, registro de síntomas, foro, diario, cartilla, recursos y Endo-Voces.'},
};
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db}=await authenticated(req,true);const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return json(req,{error:'Solicitud no válida.'},400);
 const {data:p}=await db.from('profiles').select('nombre,email,plan,activo,rol').eq('id',parsed.data.user_id).maybeSingle();
 const plan=p&&plans[p.plan];
 if(!p?.email||!plan||!p.activo||p.rol==='admin')return json(req,{ok:true,emailed:false});
 if(!mailConfigured())return json(req,{ok:true,emailed:false});
 const site=siteUrl();
 await sendMail({to:p.email,subject:`Tu ${plan.name} de EndoIntegral está activo`,title:`¡Listo, ${escapeHtml(capitalize(p.nombre.split(/\s+/)[0]))}!`,
  body:`<p style="margin:0 0 14px">Tu <strong>${plan.name}</strong> ya está activo. Desde hoy tienes acceso a ${plan.text}</p>
<p style="margin:0;font-size:13px;color:#74647e">Ingresa con tu correo <strong>${escapeHtml(p.email)}</strong> y tu contraseña de siempre. Si no la recuerdas, usa «¿Olvidaste tu contraseña?».</p>`,
  button:{text:'Ir a mi espacio',url:`${site}/ingresar`},
  text:`Tu ${plan.name} de EndoIntegral ya está activo. Ingresa en ${site}/ingresar con ${p.email}.`});
 return json(req,{ok:true,emailed:true});
 }catch(e){console.error('notify-plan',e instanceof Error?e.message:e);return json(req,{error:'No se pudo enviar el aviso.'},500);}});
