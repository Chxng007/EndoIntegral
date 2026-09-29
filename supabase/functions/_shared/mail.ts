import nodemailer from 'npm:nodemailer@6';
import { Buffer } from 'node:buffer';
// Correos con la imagen de EndoIntegral enviados desde el Gmail del equipo
// (GMAIL_USER + GMAIL_APP_PASSWORD, contraseña de aplicación de Google; puerto 465).
// Plantilla pensada para Gmail: colores sólidos (bgcolor) para que el modo oscuro invierta
// fondo y texto a la vez, logo incrustado (cid) y enlace visible como respaldo del botón.
export const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const siteUrl=()=>(Deno.env.get('SITE_URL')||'').replace(/\/$/,'');
export const capitalize=(v:string)=>v.charAt(0).toUpperCase()+v.slice(1);
type Mail={to:string,subject:string,title:string,body:string,button:{text:string,url:string},text:string};
function layout({title,body,button}:Mail,logo:string){
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#fff9ee;font-family:Nunito,Arial,sans-serif;color:#3b2a4d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff9ee" style="background:#fff9ee;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fffefd" style="max-width:520px;background:#fffefd;border-radius:24px;overflow:hidden;border:1px solid #eadde9">
<tr><td align="center" bgcolor="#6b4a91" style="background-color:#6b4a91;padding:34px 28px 28px">
<img src="${logo}" width="92" height="92" alt="EndoIntegral" style="border-radius:50%;border:4px solid #ffffff;display:block;background:#ffffff">
<p style="margin:18px 0 6px;font-size:11px;letter-spacing:2px;font-weight:800;color:#e7c6d8">ENDOINTEGRAL</p>
<h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:28px;line-height:1.25;color:#ffffff">${title}</h1>
</td></tr>
<tr><td style="padding:28px 32px 8px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td align="center" style="padding:24px 32px 8px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#8e6cb3" style="border-radius:999px;background-color:#8e6cb3">
<a href="${button.url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:999px">${button.text}</a>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:10px 32px 30px;font-size:12px;color:#74647e">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${button.url}" style="color:#6b4a91;word-break:break-all">${button.url}</a></td></tr>
<tr><td align="center" style="padding:0 32px 28px;font-size:11px;color:#a08fae">Si no esperabas este correo, puedes ignorarlo.<br>EndoIntegral · Cuerpo, mente y bienestar</td></tr>
</table></td></tr></table></body></html>`;
}
export const mailConfigured=()=>Boolean(Deno.env.get('GMAIL_USER')&&Deno.env.get('GMAIL_APP_PASSWORD'));
export async function sendMail(mail:Mail){
 const user=Deno.env.get('GMAIL_USER')!,pass=Deno.env.get('GMAIL_APP_PASSWORD')!,site=siteUrl();
 const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user,pass:pass.replace(/\s+/g,'')}});
 // El logo va adjunto e incrustado (cid) para que se vea aunque el lector bloquee imágenes externas.
 const logoResponse=await fetch(`${site}/img/logo-circular.jpeg`).catch(()=>null);
 const logoBytes=logoResponse?.ok?new Uint8Array(await logoResponse.arrayBuffer()):null;
 const logo=logoBytes?'cid:logo@endointegral':`${site}/img/logo-circular.jpeg`;
 await transport.sendMail({from:`EndoIntegral <${user}>`,replyTo:user,to:mail.to,subject:mail.subject,text:mail.text,html:layout(mail,logo),
  attachments:logoBytes?[{filename:'endointegral.jpeg',content:Buffer.from(logoBytes),contentType:'image/jpeg',cid:'logo@endointegral'}]:[]});
}
