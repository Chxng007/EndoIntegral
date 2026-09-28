import { z } from 'npm:zod@4';
import { authenticated,json,preflight } from '../_shared/http.ts';
const schema=z.object({nombre:z.string().trim().min(3).max(80),email:z.email(),plan:z.enum(['diagnostico','orienta','aprende']).default('aprende'),rol:z.enum(['miembra','admin']).default('miembra')});
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db}=await authenticated(req,true);const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return json(req,{error:'Revisa los datos de la invitación.'},400);
 const {nombre,email,plan,rol}=parsed.data;
 if(rol==='admin'){const {count}=await db.from('profiles').select('id',{count:'exact',head:true}).eq('rol','admin').eq('activo',true);if((count??0)>=5)return json(req,{error:'Ya hay 5 administradoras activas.'},400);}
 const {data,error}=await db.auth.admin.inviteUserByEmail(email,{redirectTo:`${Deno.env.get('SITE_URL')}/ingresar?modo=contrasena`,data:{nombre}});
 if(error||!data.user)return json(req,{error:'No se pudo invitar a esta cuenta. Comprueba si ya existe.'},400);
 const profile=await db.from('profiles').insert({id:data.user.id,nombre,plan,rol,activo:true});
 if(profile.error){await db.auth.admin.deleteUser(data.user.id);return json(req,{error:'No se pudo activar el perfil. La invitación quedó invalidada.'},500);}
 return json(req,{ok:true});
 }catch{return json(req,{error:'No autorizado o solicitud no válida.'},403);}});
