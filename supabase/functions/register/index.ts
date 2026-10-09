import { z } from 'npm:zod@4';
import { json,preflight,service } from '../_shared/http.ts';
import { capitalize,escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// Registro gratuito: crea la cuenta sin plan ('ninguno', vía trigger on_auth_user_created) y envía,
// desde el Gmail del equipo, un enlace para confirmar el correo. El enlace lleva un token_hash que
// la página verifica con verifyOtp, así que funciona en cualquier navegador.
const schema=z.object({nombre:z.string().trim().min(2).max(80),email:z.email().max(254),password:z.string().min(10).max(72)});
async function sha256(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');}
Deno.serve(async(req)=>{
 const response=preflight(req);if(response)return response;
 // Misma respuesta exista o no la cuenta: no revela qué correos están registrados.
 const done=json(req,{ok:true});
 try{
  const parsed=schema.safeParse(await req.json());if(!parsed.success)return json(req,{error:'Revisa tu nombre, correo y contraseña (mínimo 10 caracteres).'},400);
  const {nombre,password}=parsed.data,email=parsed.data.email.toLowerCase(),db=service();
  if(!mailConfigured())return json(req,{error:'El registro no está disponible en este momento. Escríbenos.'},503);
  const salt=Deno.env.get('RATE_LIMIT_SALT');if(!salt)return json(req,{error:'Servicio temporalmente no disponible.'},503);
  const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const limits=await Promise.all([`signup:ip:${ip}`,`signup:email:${email}`].map(async k=>db.rpc('consume_contact_limit',{key_value:await sha256(`${salt}:${k}`)})));
  if(limits.some(r=>r.error))return json(req,{error:'Servicio temporalmente no disponible.'},503);
  if(limits.some(r=>!r.data))return json(req,{error:'Hiciste varios intentos. Intenta nuevamente en una hora.'},429);
  const signup=()=>db.auth.admin.generateLink({type:'signup',email,password,options:{data:{nombre}}});
  let {data,error}=await signup();
  if(error&&/already|registered|exists/i.test(error.message||'')){
   // Restos de una cuenta eliminada (acceso sin perfil): se limpian y se registra de nuevo.
   const existing=await db.auth.admin.generateLink({type:'magiclink',email});
   const oldId=existing.data?.user?.id;
   if(oldId){
    const {data:profile}=await db.from('profiles').select('id').eq('id',oldId).maybeSingle();
    if(!profile){await db.auth.admin.deleteUser(oldId);({data,error}=await signup());}
   }
  }
  if(error||!data?.properties?.hashed_token)return done;
  const site=siteUrl(),url=`${site}/ingresar?modo=confirmar&type=signup&token_hash=${encodeURIComponent(data.properties.hashed_token)}`;
  try{
   await sendMail({to:email,subject:'Confirma tu cuenta de EndoIntegral',title:`Hola, ${escapeHtml(capitalize(nombre.split(/\s+/)[0]))}`,
    body:`<p style="margin:0 0 14px">Gracias por crear tu cuenta en EndoIntegral. Confirma que <strong>${escapeHtml(email)}</strong> es tu correo para activarla.</p>
<p style="margin:0;font-size:13px;color:#74647e">Con tu cuenta gratuita podrás conocer los planes y solicitar el que mejor se ajuste a tu momento. El enlace caduca en 24 horas.</p>`,
    button:{text:'Confirmar mi cuenta',url},
    text:`Hola ${nombre}, confirma tu cuenta de EndoIntegral con este enlace (caduca en 24 horas):\n${url}\n\nSi no creaste esta cuenta, ignora este correo.`});
  }catch(e){
   console.error('No se pudo enviar el correo de registro',e instanceof Error?e.message:e);
   if(data.user?.id)await db.auth.admin.deleteUser(data.user.id);
   return json(req,{error:'No pudimos enviar el correo de confirmación. Intenta nuevamente en unos minutos.'},502);
  }
  return done;
 }catch{return json(req,{error:'No pudimos procesar el registro.'},400);}
});
