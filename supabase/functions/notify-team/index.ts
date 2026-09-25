import { json,service } from '../_shared/http.ts';
// Invoke using a scheduled server request or Database Webhook with the shared secret.
// Resend receives only a notification type + record ID, never health information.
Deno.serve(async(req)=>{
 if(req.method!=='POST')return json(req,{error:'Método no permitido.'},405);
 const secret=Deno.env.get('WEBHOOK_SECRET');
 if(!secret||req.headers.get('x-webhook-secret')!==secret)return json(req,{error:'No autorizado.'},403);
 const key=Deno.env.get('RESEND_API_KEY'),to=Deno.env.get('TEAM_EMAIL'),from=Deno.env.get('RESEND_FROM');
 if(!key||!to||!from)return json(req,{error:'Configura el correo del equipo.'},503);
 const db=service();
 const {data:pending,error}=await db.from('notification_outbox').select('id,tipo,record_id').is('sent_at',null).order('created_at').limit(20);
 if(error)return json(req,{error:'No pudimos leer las notificaciones.'},500);
 let sent=0;
 for(const item of pending||[]){
  const label=item.tipo==='contact'?'mensaje de contacto':'solicitud de acompañamiento';
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':item.id},body:JSON.stringify({from,to:[to],subject:`EndoIntegral · Nuevo ${label}`,text:`Hay un nuevo ${label}.\n\nIngresa de forma segura al panel del equipo: ${Deno.env.get('SITE_URL')}/admin\n\nReferencia: ${item.record_id}`})});
  if(response.ok){await db.from('notification_outbox').update({sent_at:new Date().toISOString()}).eq('id',item.id);sent++;}
 }
 return json(req,{sent,pending:(pending?.length||0)-sent});
});
