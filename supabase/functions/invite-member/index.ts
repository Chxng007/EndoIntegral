import { z } from 'npm:zod@4';
import { authenticated,json,preflight } from '../_shared/http.ts';
import { capitalize,escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// Crea la cuenta con una contraseña temporal y la envía desde el Gmail del equipo.
// En el primer ingreso la persona debe cambiarla (profiles.debe_cambiar_contrasena).
const schema=z.object({nombre:z.string().trim().min(3).max(80),email:z.email(),plan:z.enum(['diagnostico','orienta','aprende']).default('aprende'),rol:z.enum(['miembra','admin']).default('miembra')});
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
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db}=await authenticated(req,true);const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return json(req,{error:'Revisa los datos de la invitación.'},400);
 const {nombre,email,plan,rol}=parsed.data;
 if(rol==='admin'){const {count}=await db.from('profiles').select('id',{count:'exact',head:true}).eq('rol','admin').eq('activo',true);if((count??0)>=6)return json(req,{error:'Ya hay 6 administradoras activas.'},400);}
 const password=temporaryPassword();
 const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nombre}});
 if(error||!data.user)return json(req,{error:/already|registered|exists/i.test(error?.message||'')?'Ya existe una cuenta con ese correo.':'No se pudo crear la cuenta.'},400);
 const profile=await db.from('profiles').insert({id:data.user.id,nombre,plan,rol,activo:true,debe_cambiar_contrasena:true});
 if(profile.error){await db.auth.admin.deleteUser(data.user.id);return json(req,{error:'No se pudo activar el perfil. La invitación quedó invalidada.'},500);}
 let emailed=false;
 if(mailConfigured()){
  try{await sendMail(invitation(nombre,email,password,rol));emailed=true;}
  catch(e){console.error('No se pudo enviar el correo de invitación',e instanceof Error?e.message:e);}
 }
 // Si el correo no salió, la administradora ve la contraseña temporal para compartirla ella misma.
 return json(req,emailed?{ok:true,emailed}:{ok:true,emailed,password});
 }catch{return json(req,{error:'No autorizado o solicitud no válida.'},403);}});
