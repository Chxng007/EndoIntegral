import { z } from 'npm:zod@4';
import nodemailer from 'npm:nodemailer@6';
import { Buffer } from 'node:buffer';
import { authenticated,json,preflight } from '../_shared/http.ts';
// Crea la cuenta con una contraseña temporal y la envía desde el Gmail del equipo
// (GMAIL_USER + GMAIL_APP_PASSWORD, contraseña de aplicación de Google; puerto 465).
// En el primer ingreso la persona debe cambiarla (profiles.debe_cambiar_contrasena).
const schema=z.object({nombre:z.string().trim().min(3).max(80),email:z.email(),plan:z.enum(['diagnostico','orienta','aprende']).default('aprende'),rol:z.enum(['miembra','admin']).default('miembra')});
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function temporaryPassword(){const bytes=crypto.getRandomValues(new Uint8Array(12));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');}
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
// Plantilla pensada para Gmail: colores sólidos (bgcolor) en lugar de degradados para que el
// modo oscuro invierta fondo y texto a la vez, logo incrustado (cid) y enlace visible como respaldo.
function invitationHtml(nombre:string,email:string,password:string,rol:string,site:string,logo:string){
 const word=nombre.split(/\s+/)[0],first=escape(word.charAt(0).toUpperCase()+word.slice(1)),role=rol==='admin'?'administradora del equipo':'miembra';
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#fff9ee;font-family:Nunito,Arial,sans-serif;color:#3b2a4d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff9ee" style="background:#fff9ee;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fffefd" style="max-width:520px;background:#fffefd;border-radius:24px;overflow:hidden;border:1px solid #eadde9">
<tr><td align="center" bgcolor="#6b4a91" style="background-color:#6b4a91;padding:34px 28px 28px">
<img src="${logo}" width="92" height="92" alt="EndoIntegral" style="border-radius:50%;border:4px solid #ffffff;display:block;background:#ffffff">
<p style="margin:18px 0 6px;font-size:11px;letter-spacing:2px;font-weight:800;color:#e7c6d8">ENDOINTEGRAL</p>
<h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:28px;line-height:1.25;color:#ffffff">Te damos la bienvenida, ${first}</h1>
</td></tr>
<tr><td style="padding:28px 32px 8px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">Te invitamos a EndoIntegral como <strong>${role}</strong>. Estos son tus datos para ingresar:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f7eff8" style="background:#f7eff8;border:1px solid #eaddE9;border-radius:16px">
<tr><td style="padding:16px 20px;font-size:13px;color:#74647e">Correo<br><strong style="font-size:15px;color:#3b2a4d">${escape(email)}</strong></td></tr>
<tr><td style="padding:0 20px 16px;font-size:13px;color:#74647e">Contraseña temporal<br><strong style="font-size:20px;letter-spacing:1px;font-family:Consolas,monospace;color:#6b4a91">${password}</strong></td></tr>
</table>
<p style="margin:18px 0 0;font-size:13px;color:#74647e">Por tu seguridad, al ingresar por primera vez te pediremos crear una contraseña nueva.</p>
</td></tr>
<tr><td align="center" style="padding:24px 32px 8px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#8e6cb3" style="border-radius:999px;background-color:#8e6cb3">
<a href="${site}/ingresar" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:999px">Ingresar a EndoIntegral</a>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:10px 32px 30px;font-size:12px;color:#74647e">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${site}/ingresar" style="color:#6b4a91;word-break:break-all">${site}/ingresar</a></td></tr>
<tr><td align="center" style="padding:0 32px 28px;font-size:11px;color:#a08fae">Si no esperabas este correo, puedes ignorarlo.<br>EndoIntegral · Cuerpo, mente y bienestar</td></tr>
</table></td></tr></table></body></html>`;
}
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db}=await authenticated(req,true);const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return json(req,{error:'Revisa los datos de la invitación.'},400);
 const {nombre,email,plan,rol}=parsed.data;
 if(rol==='admin'){const {count}=await db.from('profiles').select('id',{count:'exact',head:true}).eq('rol','admin').eq('activo',true);if((count??0)>=5)return json(req,{error:'Ya hay 5 administradoras activas.'},400);}
 const password=temporaryPassword();
 const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nombre}});
 if(error||!data.user)return json(req,{error:/already|registered|exists/i.test(error?.message||'')?'Ya existe una cuenta con ese correo.':'No se pudo crear la cuenta.'},400);
 const profile=await db.from('profiles').insert({id:data.user.id,nombre,plan,rol,activo:true,debe_cambiar_contrasena:true});
 if(profile.error){await db.auth.admin.deleteUser(data.user.id);return json(req,{error:'No se pudo activar el perfil. La invitación quedó invalidada.'},500);}
 const user=Deno.env.get('GMAIL_USER'),pass=Deno.env.get('GMAIL_APP_PASSWORD'),site=(Deno.env.get('SITE_URL')||'').replace(/\/$/,'');
 let emailed=false;
 if(user&&pass){
  try{
   const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user,pass:pass.replace(/\s+/g,'')}});
   // El logo va adjunto e incrustado (cid) para que se vea aunque el lector bloquee imágenes externas.
   const logoResponse=await fetch(`${site}/img/logo-circular.jpeg`).catch(()=>null);
   const logoBytes=logoResponse?.ok?new Uint8Array(await logoResponse.arrayBuffer()):null;
   const logo=logoBytes?'cid:logo@endointegral':`${site}/img/logo-circular.jpeg`;
   await transport.sendMail({from:`EndoIntegral <${user}>`,replyTo:user,to:email,subject:'Tu invitación a EndoIntegral',
    text:`Hola ${nombre}, te invitamos a EndoIntegral.\n\nCorreo: ${email}\nContraseña temporal: ${password}\n\nIngresa en ${site}/ingresar. Al entrar por primera vez te pediremos crear una contraseña nueva.`,
    html:invitationHtml(nombre,email,password,rol,site,logo),
    attachments:logoBytes?[{filename:'endointegral.jpeg',content:Buffer.from(logoBytes),contentType:'image/jpeg',cid:'logo@endointegral'}]:[]});
   emailed=true;
  }catch(e){console.error('No se pudo enviar el correo de invitación',e instanceof Error?e.message:e);}
 }
 // Si el correo no salió, la administradora ve la contraseña temporal para compartirla ella misma.
 return json(req,emailed?{ok:true,emailed}:{ok:true,emailed,password});
 }catch{return json(req,{error:'No autorizado o solicitud no válida.'},403);}});
