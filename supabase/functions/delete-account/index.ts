import { authenticated,json,preflight } from '../_shared/http.ts';
Deno.serve(async(req)=>{const response=preflight(req);if(response)return response;try{
 const {db,user}=await authenticated(req);const body=await req.json();
 if(body.confirmation!=='ELIMINAR')return json(req,{error:'Falta la confirmación.'},400);
 const {data:profile}=await db.from('profiles').select('rol').eq('id',user.id).single();
 if(profile?.rol==='admin')return json(req,{error:'El equipo debe transferir la administración antes de eliminar esta cuenta.'},409);
 const {error}=await db.auth.admin.deleteUser(user.id);
 if(error)return json(req,{error:'No fue posible eliminar la cuenta. Contacta al equipo.'},500);
 return json(req,{ok:true});
 }catch{return json(req,{error:'No autorizado.'},403);}});
