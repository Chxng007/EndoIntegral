import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('portada, modelo 3D y navegación a planes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:/No eres una/})).toBeVisible();
 await expect(page.locator('canvas')).toBeVisible({timeout:20000});
 await page.getByRole('button',{name:'Pausar animación'}).click();await expect(page.getByRole('button',{name:'Reanudar animación'})).toBeVisible();
 await page.getByRole('link',{name:'Conocer el programa',exact:true}).click();await expect(page).toHaveURL(/programa/);
 await expect(page.getByRole('heading',{name:'Diagnóstico',exact:true})).toBeVisible();
 await page.locator('.plan-card').first().locator('summary').click();await expect(page.getByText('Entrevista semiestructurada individual.')).toBeVisible();
 await page.getByRole('link',{name:'Quiero este plan'}).first().click();await expect(page.getByLabel('Asunto')).toHaveValue('plan-diagnostico');
 expect(errors).toEqual([]);
});
test('contacto valida campos y no simula envíos sin backend',async({page})=>{
 await page.goto('/contacto');await page.getByRole('button',{name:'Enviar mensaje'}).click();await expect(page.getByText('Escribe al menos 3 caracteres.')).toBeVisible();
 await page.getByLabel('Nombre completo').fill('Ana de prueba');await page.getByLabel('Correo electrónico').fill('ana@example.com');await page.getByLabel('Tu mensaje').fill('Quisiera conocer el plan de acompañamiento.');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Enviar mensaje'}).click();await expect(page.locator('.form-status').last()).toBeVisible();
 // Con backend real el mensaje sí se guarda; sin backend, nunca se simula el éxito.
 if(!process.env.VITE_SUPABASE_URL)await expect(page.getByText('Mensaje recibido.')).toHaveCount(0);
});
test('rutas privadas requieren sesión y recuperación no simula correos',async({page})=>{
 for(const url of ['/app/sintomas','/app/foro','/admin/podcasts']){await page.goto(url);await expect(page).toHaveURL(/ingresar/);await expect(page.getByRole('heading',{name:'Bienvenida de vuelta'})).toBeVisible();}
 await page.getByRole('button',{name:'¿Olvidaste tu contraseña?'}).click();await page.getByLabel('Correo electrónico').fill('ana@example.com');await page.getByRole('button',{name:'Enviar enlace'}).click();await expect(page.getByText(/El servicio todavía no está habilitado|Si el correo está registrado/)).toBeVisible();
});
test('pestañas anatómicas accesibles y toda la web cabe en la pantalla',async({page})=>{
 await page.goto('/endometriosis');await page.getByRole('tab',{name:'Tipo II',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Tipo II – Ovárica');await page.getByRole('tab',{name:'Tipo II',exact:true}).press('ArrowRight');await expect(page.getByRole('tab',{name:'Tipo III',exact:true})).toHaveAttribute('aria-selected','true');
 for(const url of ['/','/programa','/endometriosis','/contacto','/ingresar','/privacidad','/no-existe']){await page.goto(url);await page.locator('h1').waitFor();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),url).toBeTruthy();}
});
test('accesibilidad en páginas públicas',async({page},testInfo)=>{
 for(const url of ['/','/programa','/contacto','/ingresar']){await page.goto(url);await page.locator('h1').waitFor();const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();await testInfo.attach(`axe-${url.replaceAll('/','')||'inicio'}`,{body:JSON.stringify(result.violations,null,2),contentType:'application/json'});expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),url).toEqual([]);}
});
test('movimiento reducido y alternativa sin WebGL',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')return null;return original.call(this,type,...args);};});await page.goto('/');await expect(page.getByAltText(/Ilustración del útero/)).toBeVisible();await expect(page.getByRole('link',{name:'Conocer el programa',exact:true})).toBeVisible();expect(await page.locator('canvas').count()).toBe(0);
});
