import * as THREE from 'three';

// A stylized, front-facing anatomy study based on the client's reference.
// Every object is named so that an artist can replace it with a Blender GLB.
export function createReproductiveModel() {
  const root = new THREE.Group(); root.name = 'Sistema_reproductor';
  const rose = new THREE.MeshPhysicalMaterial({ color:'#e8a9bb', roughness:.27, metalness:.04, clearcoat:1, clearcoatRoughness:.2, sheen:1, sheenColor:'#fff2e9', transparent:true, opacity:.94, side:THREE.DoubleSide });
  const inner = new THREE.MeshPhysicalMaterial({ color:'#ba7c97', roughness:.37, clearcoat:.8, sheen:1, sheenColor:'#f7cad7' });
  const pearl = new THREE.MeshPhysicalMaterial({ color:'#d9b1da', roughness:.28, clearcoat:1, metalness:.05, sheen:1, sheenColor:'#fff3ed' });
  const pale = new THREE.MeshPhysicalMaterial({ color:'#e2bdcf', roughness:.4, transparent:true, opacity:.10, depthWrite:false, side:THREE.DoubleSide });
  function add(name, geometry, material, pos=[0,0,0], scale=[1,1,1]) { const mesh=new THREE.Mesh(geometry,material); mesh.name=name; mesh.position.set(...pos); mesh.scale.set(...scale); root.add(mesh); return mesh; }
  function tube(name, points, radius, mat=rose) { return add(name, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),64,radius,12,false), mat); }
  const outline = new THREE.Shape();
  outline.moveTo(0,1.02); outline.bezierCurveTo(.48,1.03,.83,.84,1.04,.58); outline.bezierCurveTo(.99,.29,.69,-.01,.53,-.39); outline.bezierCurveTo(.35,-.8,.25,-1.0,.24,-1.31); outline.quadraticCurveTo(0,-1.42,-.24,-1.31); outline.bezierCurveTo(-.25,-1.0,-.35,-.8,-.53,-.39); outline.bezierCurveTo(-.69,-.01,-.99,.29,-1.04,.58); outline.bezierCurveTo(-.83,.84,-.48,1.03,0,1.02);
  const geo = new THREE.ExtrudeGeometry(outline,{ depth:.33, bevelEnabled:true, bevelSegments:5, steps:1, bevelSize:.13, bevelThickness:.16, curveSegments:28 });
  geo.computeVertexNormals(); add('Utero',geo,rose,[0,.15,-.24]);
  const cavity = new THREE.Shape(); cavity.moveTo(-.77,.58); cavity.bezierCurveTo(-.37,.7,.37,.7,.77,.58); cavity.bezierCurveTo(.56,.44,.27,.09,.15,-.61); cavity.lineTo(.10,-1.08); cavity.quadraticCurveTo(0,-1.15,-.10,-1.08); cavity.lineTo(-.15,-.61); cavity.bezierCurveTo(-.27,.09,-.56,.44,-.77,.58);
  add('Cavidad_uterina',new THREE.ExtrudeGeometry(cavity,{depth:.026,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:3,curveSegments:28}),inner,[0,.15,.275]);
  const lining = new THREE.MeshPhysicalMaterial({color:'#f8d4d7',roughness:.4,clearcoat:.7});
  tube('Endometrio_izquierdo',[[-.77,.73,.37],[-.47,.4,.39],[-.27,-.07,.4],[-.15,-.62,.4],[-.09,-.94,.4]],.038,lining);
  tube('Endometrio_derecho',[[.77,.73,.37],[.47,.4,.39],[.27,-.07,.4],[.15,-.62,.4],[.09,-.94,.4]],.038,lining);
  tube('Endometrio_fondo',[[-.74,.76,.36],[0,.81,.37],[.74,.76,.36]],.035,lining);
  add('Cervix',new THREE.CylinderGeometry(.20,.28,.62,40,1,true),rose,[0,-1.38,0],[1,1,.72]);
  for(const s of [-1,1]) {
    const side=s===-1?'L':'R';
    tube(`Trompa_${side}`,[[s*.85,.76,0],[s*1.3,.8,-.03],[s*1.91,1.1,-.02],[s*2.47,1.14,.01],[s*2.78,.85,.03],[s*2.77,.43,.05],[s*2.53,.20,.09]],.105);
    const ovary=add(`Ovario_${side}`,new THREE.SphereGeometry(.38,36,28),pearl,[s*2.05,-.02,.05],[1.1,1.15,.85]);
    for(let k=0;k<38;k++) {
      const y=1-(k+.5)/38*2, r=Math.sqrt(1-y*y), a=k*2.399963;
      const follicle = new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),pearl);
      follicle.position.set(r*Math.cos(a)*.365,y*.365,r*Math.sin(a)*.365); ovary.add(follicle);
    }
    for(let k=0;k<6;k++) tube(`Fimbrias_${side}_${k}`,[[s*2.55,.22,.07],[s*(2.40+k*.085),-.03,.10],[s*(2.22+k*.12),-.29-(k%3)*.07,.14]],.037);
    tube(`Ligamentos_${side}`,[[s*.63,-.08,-.17],[s*1.24,-.34,-.24],[s*1.78,-.08,-.11]],.028,lining);
  }
  const peritoneum=add('Peritoneo',new THREE.SphereGeometry(2.48,48,24),pale,[0,.05,-.35],[1.15,.69,.17]);
  peritoneum.visible=false;
  add('Vejiga',new THREE.SphereGeometry(.52,24,16),pale.clone(),[.52,-1.12,-.45],[1,.7,.7]).visible=false;
  add('Recto',new THREE.CapsuleGeometry(.14,1.25,6,12),pale.clone(),[-.6,-.68,-.45]).visible=false;
  const anchors = {Peritoneo:[[.93,-.28,.27],[-.98,-.14,.3],[1.35,-.28,.15],[-1.39,-.36,.17],[.56,-.65,.31],[-.52,-.66,.32],[1.54,.13,.2],[-1.52,.19,.16]],Ovario_L:[[-2.05,.01,.40],[-1.85,-.15,.34],[-2.23,.16,.35]],Ovario_R:[[2.05,.01,.40],[1.85,-.15,.34],[2.23,.16,.35]],Profunda:[[.5,-.95,-.13],[-.62,-.73,-.12],[.69,-.74,-.19],[-.48,-1.06,-.12],[.5,-.44,-.1],[-.43,-.48,-.1]]};
  Object.entries(anchors).forEach(([name,points])=>points.forEach((p,i)=>{ const a=new THREE.Object3D(); a.name=`Anchor_${name}_${String(i+1).padStart(2,'0')}`; a.position.set(...p);root.add(a); }));
  return root;
}
export function disposeModel(root) { const gs=new Set(),ms=new Set(); root.traverse(o=>{ if(o.geometry)gs.add(o.geometry); if(o.material)ms.add(o.material); });gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose()); }
