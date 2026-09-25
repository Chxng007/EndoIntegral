import { createClient } from 'npm:@supabase/supabase-js@2';
export function service() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth:{persistSession:false,autoRefreshToken:false} });
}
export function headers(req:Request) {
  const configured = (Deno.env.get('SITE_URL') || '').replace(/\/$/,'');
  const origin = req.headers.get('Origin');
  return {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin': origin === configured ? origin : configured,
    'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-webhook-secret',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin',
  };
}
export function json(req:Request,data:unknown,status=200) { return new Response(JSON.stringify(data),{status,headers:headers(req)}); }
export function preflight(req:Request) {
  if(req.method==='OPTIONS')return new Response('ok',{headers:headers(req)});
  if(req.method!=='POST')return json(req,{error:'Método no permitido.'},405);
  const origin=req.headers.get('Origin');
  if(origin && origin !== (Deno.env.get('SITE_URL')||'').replace(/\/$/,''))return json(req,{error:'Origen no permitido.'},403);
  return null;
}
export async function authenticated(req:Request,admin=false) {
  const db=service(),token=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');
  if(!token)throw new Error('No autorizado.');
  const {data:{user},error}=await db.auth.getUser(token);
  if(error||!user)throw new Error('No autorizado.');
  const {data:profile}=await db.from('profiles').select('rol,activo').eq('id',user.id).single();
  if(admin&&(!profile?.activo||profile?.rol!=='admin'))throw new Error('No autorizado.');
  return {db,user};
}
