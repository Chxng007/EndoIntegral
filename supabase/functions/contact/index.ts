import { z } from 'npm:zod@4';
import { json,preflight,service } from '../_shared/http.ts';
const schema=z.object({nombre:z.string().trim().min(3).max(80),email:z.email().max(254),asunto:z.enum(['general','plan-diagnostico','plan-orienta','plan-aprende','acompanamiento','otro']),telefono:z.string().max(25).refine(v=>!v||/^(\+?57\s?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(v)),mensaje:z.string().trim().min(10).max(2000),consent:z.literal(true),website:z.string().max(0)}).refine(v=>!v.asunto.startsWith('plan-')||Boolean(v.telefono),{message:'Para solicitar un plan necesitamos tu celular.',path:['telefono']});
Deno.serve(async(req)=>{
 const response=preflight(req);if(response)return response;
 if(Deno.env.get('FORMS_ENABLED')!=='true')return json(req,{error:'El formulario todavía no está habilitado.'},503);
 try {
  const body=await req.text();if(body.length>16000)return json(req,{error:'Mensaje demasiado largo.'},413);
  const parsed=schema.safeParse(JSON.parse(body));if(!parsed.success)return json(req,{error:parsed.error.issues.some(i=>i.path[0]==='telefono')?'Para solicitar un plan necesitamos tu número de celular.':'Revisa los campos del formulario.'},400);
  const values=parsed.data,db=service();
  const salt=Deno.env.get('RATE_LIMIT_SALT');if(!salt)return json(req,{error:'Servicio temporalmente no disponible.'},503);
  // Trusted gateway header; never trust a client-provided identifier alone.
  const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
  const material=new TextEncoder().encode(`${salt}:${ip}:${new Date().toISOString().slice(0,10)}`);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',material))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const emailHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}:email:${values.email.toLowerCase()}`)))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const limits=await Promise.all([hash,emailHash].map(key_value=>db.rpc('consume_contact_limit',{key_value})));
  if(limits.some(r=>r.error))return json(req,{error:'Servicio temporalmente no disponible.'},503);
  if(limits.some(r=>!r.data))return json(req,{error:'Has enviado varias solicitudes. Intenta nuevamente en una hora.'},429);
  const {consent,website,...message}=values;
  const {error}=await db.from('contact_messages').insert({...message,consent_version:'1.0'});
  if(error)return json(req,{error:'No pudimos guardar el mensaje. Intenta nuevamente.'},500);
  // Un trigger encola el aviso; notify-team lo envía al correo del equipo con los datos de contacto.
  return json(req,{ok:true});
 }catch{return json(req,{error:'No pudimos procesar el formulario.'},400);}
});
