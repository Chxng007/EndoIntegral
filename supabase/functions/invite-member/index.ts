import { z } from 'npm:zod@4';
import { authenticated,json,preflight } from '../_shared/http.ts';
import { capitalize,escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// Crea la cuenta con una contraseña temporal y la envía desde el Gmail del equipo.
// En el primer ingreso la persona debe cambiarla (profiles.debe_cambiar_contrasena).
const schema=z.object({nombre:z.string().trim().min(3).max(80),email:z.email(),plan:z.enum(['ninguno','aprende','orienta','diagnostico']).default('ninguno'),rol:z.enum(['miembra','admin']).default('miembra')});
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function temporaryPassword(){const bytes=crypto.getRandomValues(new Uint8Array(12));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');}
function invitation(nombre:string,email:string,password:string,rol:string){
 const site=siteUrl(),first=escapeHtml(capitalize(nombre.split(/\s+/)[0])),role=rol==='admin'?'administradora del equipo':'miembra';
 return {to:email,subject:'Tu invitación a EndoIntegral',title:`Te damos la bienvenida, ${first}`,
  body:`<p style="margin:0 0 16px">Te invitamos a EndoIntegral como <strong>${role}</strong>. Estos son tus datos para ingresar:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f7eff8" style="background:#f7eff8;border:1px solid #eaddE9;border-radius:16px">
<tr><td style="padding:16px 20px;font-size:13px;color:#74647e">Correo<br><strong style="font-size:15px;color:#3b2a4d">${escapeHtml(email)}</strong></td></tr>
<tr><td style="padding:0 20px 16px;font-size:13px;color:#74647e">Contraseña temporal<br><strong style="font-size:20px;letter-spacing:1px;font-family:Consolas,monospace;color:#6b4a91">${password}</strong></td></tr>
</table>
<p style="margin:18px 0 0;font-size:13px;color:#74647e">Por tu seguridad, al ingresar por primera vez te pediremos crear una contraseña nueva.</p>`,
  button:{text:'Ingresar a EndoIntegral',url:`${site}/ingresar`},
  text:`Hola ${nombre}, te invitamos a EndoIntegral.\n\nCorreo: ${email}\nContraseña temporal: ${password}\n\nIngresa en ${site}/ingresar. Al entrar por primera vez te pediremos crear una contraseña nueva.`};
}
const planLabels:Record<string,string>={ninguno:'cuenta gratuita',aprende:'Plan 1 · Aprende',orienta:'Plan 2 · Orienta',diagnostico:'Plan 3 · Diagnosticadas'};
// Aviso para quien ya tenía cuenta: no se cambia su contraseña, solo su plan o rol.
function accountUpdated(nombre:string,email:string,plan:string,rol:string){
 const site=siteUrl(),first=escapeHtml(capitalize(nombre.split(/\s+/)[0]));
 const what=rol==='admin'?'Ahora eres <strong>administradora del equipo</strong> de EndoIntegral.':plan==='ninguno'?'Tu cuenta gratuita de EndoIntegral está activa.':`Tu <strong>${planLabels[plan]}</strong> ya está activo en tu cuenta.`;
 return {to:email,subject:rol==='admin'?'Ya eres parte del equipo EndoIntegral':'Tu cuenta de EndoIntegral se actualizó',title:`Hola, ${first}`,
  body:`<p style="margin:0 0 14px">${what}</p>
<p style="margin:0;font-size:13px;color:#74647e">Ingresa con tu correo <strong>${escapeHtml(email)}</strong> y tu contraseña de siempre. Si no la recuerdas, usa «¿Olvidaste tu contraseña?» en la página de ingreso.</p>`,
  button:{text:'Ingresar a EndoIntegral',url:`${site}/ingresar`},
  text:`Tu cuenta de EndoIntegral se actualizó (${rol==='admin'?'administradora del equipo':planLabels[plan]}). Ingresa en ${site}/ingresar con ${email}.`};
}
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db}=await authenticated(req,true);const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return json(req,{error:'Revisa los datos de la invitación.'},400);
 const {nombre,email,plan,rol}=parsed.data;
 const adminsActive=async()=>{const {count}=await db.from('profiles').select('id',{count:'exact',head:true}).eq('rol','admin').eq('activo',true);return count??0;};
 const finalPlan=rol==='admin'?'diagnostico':plan;
 const password=temporaryPassword();
 const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nombre}});
 if(error||!data.user){
  if(!/already|registered|exists/i.test(error?.message||''))return json(req,{error:'No se pudo crear la cuenta.'},400);
  // El correo ya tiene cuenta (p. ej., se registró gratis): se le asigna el plan y el rol a esa misma cuenta.
  const link=await db.auth.admin.generateLink({type:'magiclink',email});
  const userId=link.data?.user?.id;
  if(!userId)return json(req,{error:'Ese correo ya tiene cuenta, pero no pudimos encontrarla.'},400);
  const {data:current}=await db.from('profiles').select('nombre,rol').eq('id',userId).maybeSingle();
  if(rol==='admin'&&current?.rol!=='admin'&&(await adminsActive())>=6)return json(req,{error:'Ya hay 6 administradoras activas.'},400);
  const saved=await db.from('profiles').upsert({id:userId,nombre:current?.nombre||nombre,email,plan:finalPlan,rol,activo:true},{onConflict:'id'});
  if(saved.error)return json(req,{error:'No pudimos actualizar esa cuenta.'},500);
  let emailed=false;
  if(mailConfigured()){
   try{await sendMail(accountUpdated(current?.nombre||nombre,email,finalPlan,rol));emailed=true;}
   catch(e){console.error('No se pudo enviar el aviso de cuenta actualizada',e instanceof Error?e.message:e);}
  }
  return json(req,{ok:true,existing:true,emailed});
 }
 if(rol==='admin'&&(await adminsActive())>=6){await db.auth.admin.deleteUser(data.user.id);return json(req,{error:'Ya hay 6 administradoras activas.'},400);}
 // El trigger on_auth_user_created ya creó el perfil gratuito: aquí se completa con el plan y el rol.
 const profile=await db.from('profiles').upsert({id:data.user.id,nombre,email,plan:finalPlan,rol,activo:true,debe_cambiar_contrasena:true},{onConflict:'id'});
 if(profile.error){await db.auth.admin.deleteUser(data.user.id);return json(req,{error:'No se pudo activar el perfil. La invitación quedó invalidada.'},500);}
 let emailed=false;
 if(mailConfigured()){
  try{await sendMail(invitation(nombre,email,password,rol));emailed=true;}
  catch(e){console.error('No se pudo enviar el correo de invitación',e instanceof Error?e.message:e);}
 }
 // Si el correo no salió, la administradora ve la contraseña temporal para compartirla ella misma.
 return json(req,emailed?{ok:true,emailed}:{ok:true,emailed,password});
 }catch{return json(req,{error:'No autorizado o solicitud no válida.'},403);}});
