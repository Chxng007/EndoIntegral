import { z } from 'npm:zod@4';
import { json,preflight,service } from '../_shared/http.ts';
import { capitalize,escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// Recuperación de contraseña con el correo de EndoIntegral (en vez de la plantilla de Supabase).
// El enlace lleva un token_hash que la página verifica con verifyOtp: funciona aunque se abra en
// otro navegador (p. ej., dentro de la app de Gmail), a diferencia del enlace PKCE de Supabase.
const schema=z.object({email:z.email().max(254)});
async function sha256(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');}
Deno.serve(async(req)=>{
 const response=preflight(req);if(response)return response;
 // Siempre la misma respuesta: no revela si el correo tiene cuenta.
 const done=json(req,{ok:true});
 try{
  const parsed=schema.safeParse(await req.json());if(!parsed.success)return json(req,{error:'Escribe un correo válido.'},400);
  const email=parsed.data.email.toLowerCase(),db=service();
  if(!mailConfigured())return json(req,{error:'La recuperación por correo no está disponible. Escríbele al equipo.'},503);
  const salt=Deno.env.get('RATE_LIMIT_SALT');if(!salt)return json(req,{error:'Servicio temporalmente no disponible.'},503);
  const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const limits=await Promise.all([`reset:ip:${ip}`,`reset:email:${email}`].map(async k=>db.rpc('consume_contact_limit',{key_value:await sha256(`${salt}:${k}`)})));
  if(limits.some(r=>r.error))return json(req,{error:'Servicio temporalmente no disponible.'},503);
  if(limits.some(r=>!r.data))return json(req,{error:'Ya pediste varios enlaces. Intenta nuevamente en una hora.'},429);
  const {data,error}=await db.auth.admin.generateLink({type:'recovery',email});
  if(error||!data?.properties?.hashed_token)return done;
  // Una cuenta eliminada (sin perfil) o desactivada no recibe enlace: para la página no existe.
  const {data:profile}=await db.from('profiles').select('nombre,activo').eq('id',data.user.id).maybeSingle();
  if(!profile?.activo)return done;
  const site=siteUrl(),url=`${site}/ingresar?modo=contrasena&type=recovery&token_hash=${encodeURIComponent(data.properties.hashed_token)}`;
  const first=escapeHtml(capitalize((profile.nombre||'').split(/\s+/)[0]||''));
  try{
   await sendMail({to:email,subject:'Recupera tu contraseña de EndoIntegral',title:first?`Hola, ${first}`:'Recupera tu acceso',
    body:`<p style="margin:0 0 14px">Recibimos una solicitud para cambiar la contraseña de tu cuenta <strong>${escapeHtml(email)}</strong>.</p>
<p style="margin:0;font-size:13px;color:#74647e">Usa el botón para crear una contraseña nueva. El enlace funciona una sola vez y caduca en una hora.</p>`,
    button:{text:'Crear nueva contraseña',url},
    text:`Recibimos una solicitud para cambiar la contraseña de ${email}.\n\nCrea una nueva aquí (funciona una sola vez y caduca en una hora):\n${url}\n\nSi no fuiste tú, ignora este correo.`});
  }catch(e){console.error('No se pudo enviar el correo de recuperación',e instanceof Error?e.message:e);return json(req,{error:'No pudimos enviar el correo. Intenta nuevamente en unos minutos.'},502);}
  return done;
 }catch{return json(req,{error:'No pudimos procesar la solicitud.'},400);}
});
