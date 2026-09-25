import re,json
from pathlib import Path
text=Path('docs/sources/PROMPT_MAESTRO_EndoIntegral.md').read_text(encoding='utf-8')
out=Path('src/lib/content');out.mkdir(parents=True,exist_ok=True)
def write(name,data): (out/name).write_text('export default '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
def block(start,end): return text.split(start,1)[1].split(end,1)[0].strip()
def clean(s): return re.sub(r'\*\*|\*|^> ?', '', s, flags=re.M).strip()
plans=[]
for n,id in [(1,'diagnostico'),(2,'orienta'),(3,'aprende')]:
    data=block(f'**PLAN {n} —',f'**PLAN {n+1} —' if n<3 else 'Debajo: tabla comparativa')
    heading=data.split('\n')[0]
    plans.append({'id':id,'name':heading.split('EndoIntegral ')[1].split('**')[0], 'weeks':[10,8,6][n-1], 'audience':clean(block(f'**PLAN {n} —',f'**PLAN {n+1} —' if n<3 else 'Debajo: tabla comparativa').split('*Para:*')[1].split('*Objetivo:*')[0]), 'objective':clean(data.split('*Objetivo:*')[1].split('*Incluye:*')[0]), 'includes':[s[2:] for s in data.split('*Incluye:*')[1].splitlines() if s.startswith('- ')]})
write('programa.js',{
    'about':clean(block('**¿Quiénes somos?** (tal cual)','+ `VideoSlot` institucional.')),
    'reason':clean(block('**Motivo de creación** (tal cual, en recuadro amarillo pastel punteado)','**Misión y Visión**')),
    'mission':clean(block('- 🎯 **Misión:**','- 👁️ **Visión:**')),
    'vision':clean(block('- 👁️ **Visión:**','**Valores institucionales**')),
    'values':[{'name':m[0],'text':m[1]} for m in re.findall(r'- \*\*(.*?):\*\* (.*)',block('**Valores institucionales**','**Planes**'))],
    'plans':plans})
write('inicio.js',{
    'description':'EndoIntegral acompaña cuerpo, mente y hábitos diarios de mujeres con endometriosis, con educación clara, contención emocional y un programa guiado paso a paso.',
    'benefits':[
    {'icon':'BookOpen','title':'Educación clara','text':'Información médica accesible, sin tecnicismos.','to':'/endometriosis'},
    {'icon':'Flower2','title':'Bienestar diario','text':'Hábitos y check-ins que se adaptan a tus días.','to':'/programa'},
    {'icon':'Route','title':'Mapa de niveles','text':'Progresa por fases: Calma, Tormenta y Renacer.','soon':True},
    {'icon':'Headphones','title':'Endo-Voces','text':'Un podcast para acompañarte en tus días de fatiga.','to':'/ingresar','locked':True}],
    'modules':[
    {'id':'endo-voces','name':'Endo-Voces','icon':'Headphones','text':'Escucha, descansa, conecta.'},
    {'id':'acompanamiento','name':'Acompañamiento emocional','icon':'HeartHandshake','text':'Apoyo profesional a tu ritmo.'},
    {'id':'sintomas','name':'Registro de síntomas','icon':'ClipboardList','text':'Escucha lo que tu cuerpo dice.'},
    {'id':'foro','name':'Foro de la comunidad','icon':'MessagesSquare','text':'Un espacio para compartir.'},
    {'id':'diario','name':'Diario terapéutico','icon':'NotebookPen','text':'Dale un lugar a lo que sientes.'},
    {'id':'cartilla','name':'Cartilla psicoeducativa','icon':'BookOpen','text':'Herramientas para comprenderte.'},
    {'id':'recursos','name':'Recursos para tu bienestar','icon':'Sprout','text':'Yoga, mindfulness y calma.'}]})
print('Contenido institucional y planes completos extraídos de la fuente.')
