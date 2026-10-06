import { json,service } from '../_shared/http.ts';
import { escapeHtml,mailConfigured,sendMail,siteUrl } from '../_shared/mail.ts';
// La invoca pg_cron cada 2 minutos (ver 202609250005_notify_schedule.sql) con el secreto compartido.
// Envía al correo del equipo (TEAM_EMAIL, o el mismo GMAIL_USER) los datos de contacto de cada
// mensaje o solicitud nueva. El motivo de las solicitudes de acompañamiento (dato de salud) no se
// envía por correo: se lee en el panel del equipo.
const subjects:Record<string,string>={general:'Información general','plan-aprende':'Solicitud del Plan 1 · Aprende','plan-orienta':'Solicitud del Plan 2 · Orienta','plan-diagnostico':'Solicitud del Plan 3 · Diagnosticadas',acompanamiento:'Acompañamiento emocional',otro:'Otro'};
const row=(label:string,value?:string|null)=>value?`<tr><td style="padding:6px 0;font-size:12px;color:#74647e;width:110px;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:14px;color:#3b2a4d"><strong>${escapeHtml(value)}</strong></td></tr>`:'';
const table=(rows:string)=>`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f7eff8" style="background:#f7eff8;border:1px solid #eaddE9;border-radius:16px"><tr><td style="padding:14px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table>`;
const whatsapp=(phone?:string|null)=>{const digits=(phone||'').replace(/\D/g,'');return digits?`https://wa.me/${digits.length===10?'57'+digits:digits}`:null;};
Deno.serve(async(req)=>{
 if(req.method!=='POST')return json(req,{error:'Método no permitido.'},405);
 const secret=Deno.env.get('WEBHOOK_SECRET');
 if(!secret||req.headers.get('x-webhook-secret')!==secret)return json(req,{error:'No autorizado.'},403);
 const to=Deno.env.get('TEAM_EMAIL')||Deno.env.get('GMAIL_USER');
 if(!to||!mailConfigured())return json(req,{error:'Configura el correo del equipo.'},503);
 const db=service(),site=siteUrl();
 const {data:pending,error}=await db.from('notification_outbox').select('id,tipo,record_id').is('sent_at',null).order('created_at').limit(20);
 if(error)return json(req,{error:'No pudimos leer las notificaciones.'},500);
 let sent=0;
 for(const item of pending||[]){
  try{
   let mail;
   if(item.tipo==='contact'){
    const {data:m}=await db.from('contact_messages').select('*').eq('id',item.record_id).maybeSingle();
    if(!m){await db.from('notification_outbox').update({sent_at:new Date().toISOString()}).eq('id',item.id);continue;}
    const subject=subjects[m.asunto]||m.asunto,isPlan=String(m.asunto).startsWith('plan-'),wa=whatsapp(m.telefono);
    mail={to,subject:`EndoIntegral · ${subject} · ${m.nombre}`,title:isPlan?'Nueva solicitud de plan':'Nuevo mensaje de contacto',
     body:`<p style="margin:0 0 14px">${isPlan?'Alguien quiere adquirir un plan. Escríbele para coordinar el pago y, cuando esté confirmado, actívale el plan desde <strong>Usuarias y equipo</strong>.':'Llegó un mensaje desde el formulario de contacto.'}</p>
${table(row('Asunto',subject)+row('Nombre',m.nombre)+row('Correo',m.email)+row('Teléfono',m.telefono||'No lo indicó'))}
<p style="margin:16px 0 6px;font-size:12px;color:#74647e">Mensaje</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(m.mensaje)}</p>
${wa?`<p style="margin:16px 0 0"><a href="${wa}" style="color:#6b4a91;font-weight:700">Escribirle por WhatsApp →</a></p>`:''}`,
     button:{text:'Ver en el panel',url:`${site}/admin/mensajes`},
     text:`${subject}\nNombre: ${m.nombre}\nCorreo: ${m.email}\nTeléfono: ${m.telefono||'No lo indicó'}\n\n${m.mensaje}\n\nPanel: ${site}/admin/mensajes`};
   }else{
    const {data:a}=await db.from('appointment_requests').select('*,profiles(nombre,email,plan),professionals(nombre,cargo)').eq('id',item.record_id).maybeSingle();
    if(!a){await db.from('notification_outbox').update({sent_at:new Date().toISOString()}).eq('id',item.id);continue;}
    const p=a.profiles||{},pro=a.professionals,wa=whatsapp(a.telefono);
    mail={to,subject:`EndoIntegral · Solicitud de acompañamiento · ${p.nombre||''}`,title:'Nueva solicitud de acompañamiento',
     body:`<p style="margin:0 0 14px">Una usuaria pidió una sesión de orientación. Contáctala para confirmar fecha, modalidad y condiciones.</p>
${table(row('Nombre',p.nombre)+row('Correo',p.email)+row('Teléfono',a.telefono||'No lo indicó')+row('Modalidad',a.modalidad)+row('Horario',a.horario)+row('Profesional',pro?`${pro.nombre} · ${pro.cargo}`:'Sin preferencia'))}
<p style="margin:16px 0 0;font-size:12px;color:#74647e">Por privacidad, el motivo de la consulta solo se muestra en el panel del equipo.</p>
${wa?`<p style="margin:12px 0 0"><a href="${wa}" style="color:#6b4a91;font-weight:700">Escribirle por WhatsApp →</a></p>`:''}`,
     button:{text:'Ver la solicitud',url:`${site}/admin/solicitudes`},
     text:`Solicitud de acompañamiento\nNombre: ${p.nombre||''}\nCorreo: ${p.email||''}\nTeléfono: ${a.telefono||'No lo indicó'}\nModalidad: ${a.modalidad}\nHorario: ${a.horario}\n\nPanel: ${site}/admin/solicitudes`};
   }
   await sendMail(mail);
   await db.from('notification_outbox').update({sent_at:new Date().toISOString()}).eq('id',item.id);sent++;
  }catch(e){console.error('No se pudo enviar el aviso',item.id,e instanceof Error?e.message:e);}
 }
 return json(req,{sent,pending:(pending?.length||0)-sent});
});
