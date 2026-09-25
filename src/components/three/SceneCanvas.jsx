import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { createDesignModel, MODE_TYPE } from './designModel';
import { useReducedMotion } from '../../lib/hooks';

// Model + animation from the Claude Design "EndoIntegral Inicio" file: particle materialize intro,
// cross-section cut, gentle sway, pointer parallax and (hero only) dissolve while scrolling away.
function ReproductiveModel({ mode, reduced, paused, dissolveOnScroll, visible }) {
  const { gl, invalidate } = useThree();
  const group=useRef(); const model=useMemo(()=>createDesignModel(gl),[gl]);
  const clock=useRef(0), introClock=useRef(0), dissolve=useRef(0); const pointer=useRef({x:0,y:0,sx:0,sy:0});
  // replay the particle materialize every time the viewer comes back into view
  useEffect(()=>{if(visible)introClock.current=0;},[visible]);
  useEffect(()=>()=>model.dispose(),[model]);
  useEffect(()=>{invalidate();},[mode,invalidate]);
  // scroll-linked dissolve follows the user's own scrolling, so it also runs (on demand) with reduced motion
  useEffect(()=>{ if(!dissolveOnScroll)return; const fn=()=>invalidate(); addEventListener('scroll',fn,{passive:true}); return()=>removeEventListener('scroll',fn); },[dissolveOnScroll,invalidate]);
  useEffect(()=>{ if(reduced)return; const fn=e=>{pointer.current.x=e.clientX/innerWidth*2-1;pointer.current.y=e.clientY/innerHeight*2-1;};addEventListener('pointermove',fn,{passive:true});return()=>removeEventListener('pointermove',fn); },[reduced]);
  useFrame(({size},delta)=>{
    if(!group.current)return;
    const dt=Math.min(.05,delta); if(!paused){clock.current+=dt;introClock.current+=dt;} const time=clock.current;
    const halfH=Math.tan(15*Math.PI/180)*11, halfW=halfH*size.width/size.height;
    const s=Math.min(.88,halfW*.84/3.1,halfH*.76/2); group.current.scale.setScalar(s); group.current.position.y=.22*s;
    const p=pointer.current, k=reduced?1:1-Math.exp(-dt*4); p.sx+=(p.x-p.sx)*k; p.sy+=(p.y-p.sy)*k;
    const sway=reduced?0:Math.sin(time*.33)*(mode==='anatomia'?.3:.16);
    group.current.rotation.set(p.sy*.07,sway+p.sx*.16,0);
    let target=0;
    // starts once the viewer's centre rises above the middle of the screen, fully dissolved ~45% of a screen later
    if(dissolveOnScroll){const r=gl.domElement.getBoundingClientRect(),vh=innerHeight;target=Math.min(1,Math.max(0,(vh*.5-(r.top+r.height/2))/(vh*.45)));}
    // ease toward the scroll target so mouse-wheel jumps look as smooth as dragging the scrollbar
    const d=dissolve.current; dissolve.current=Math.abs(target-d)<.002?target:d+(target-d)*(1-Math.exp(-dt*7));
    if(dissolve.current!==target)invalidate();
    model.update({time,introTime:introClock.current,dt,reduced,type:MODE_TYPE[mode]??0,cut:mode==='anatomia',dissolve:dissolve.current});
  });
  return <group ref={group}><primitive object={model.object}/></group>;
}
function ButterflyField({ reduced, paused, count }) {
  const wing=new THREE.Shape(); wing.moveTo(0,0);wing.bezierCurveTo(.17,.33,.43,.27,.30,.06);wing.bezierCurveTo(.37,-.14,.10,-.24,0,0);
  const geometry=useMemo(()=>new THREE.ShapeGeometry(wing),[]);
  const ref=useRef();
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(({clock})=>{if(!ref.current||paused||reduced)return;ref.current.children.forEach((b,i)=>{b.position.y=Math.sin(clock.elapsedTime*.27+i*1.8)*.22+Math.sin(i*2.4)*1.55;b.rotation.y=Math.sin(clock.elapsedTime*2+i)*.6;});});
  if(reduced)return null;
  return <group ref={ref}>{Array.from({length:count},(_,i)=><group key={i} position={[Math.cos(i*2.4)*3.2,Math.sin(i*2.4)*1.55,-.4-Math.sin(i)*.7]} scale={.35+(i%3)*.15} rotation={[0,.3,(i%4)*.6]}>{[-1,1].map(s=><mesh key={s} geometry={geometry} scale={[s,1,1]}><meshStandardMaterial color={i%2?'#bca1d2':'#e5adc2'} transparent opacity={.55} side={THREE.DoubleSide}/></mesh>)}</group>)}</group>;
}
export default function SceneCanvas({ mode='anatomia', paused=false, onReady, dissolveOnScroll=false }) {
  const reduced=useReducedMotion();const [low,setLow]=useState(false);const [visible,setVisible]=useState(true);const ref=useRef();
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <div className="canvas-wrap" ref={ref}><Canvas dpr={low?1:[1,1.75]} camera={{position:[0,0,11],fov:30}} frameloop={visible&&!paused&&!reduced?'always':'demand'} gl={{alpha:true,antialias:true,powerPreference:'high-performance',localClippingEnabled:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}} onCreated={({gl})=>{gl.setClearColor(0x000000,0);gl.localClippingEnabled=true;onReady?.();}}><hemisphereLight args={['#ffe9e6','#161826',.55]}/><directionalLight position={[3,5,7]} intensity={2} color="#fff0ea"/><directionalLight position={[-5,3,-6]} intensity={3.2} color="#9184d9"/><pointLight position={[0,-3,5]} intensity={1.1} decay={0} color="#ff9fb0"/><PerformanceMonitor onDecline={()=>setLow(true)}/><ReproductiveModel mode={mode} reduced={reduced} paused={paused} dissolveOnScroll={dissolveOnScroll} visible={visible}/><ButterflyField reduced={reduced} paused={paused} count={low?6:12}/><OrbitControls enableZoom={false} enablePan={false} enableDamping={!reduced} minPolarAngle={Math.PI*.34} maxPolarAngle={Math.PI*.66} minAzimuthAngle={-.6} maxAzimuthAngle={.6}/></Canvas></div>;
}
