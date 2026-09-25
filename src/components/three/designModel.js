import * as THREE from 'three';

// Procedural reproductive-system model ported from the Claude Design "EndoIntegral Inicio" file:
// sectioned uterus with fibrous cut face, follicled ovaries, fimbriae, studio lighting and a
// particle "materialize / dissolve" effect driven by uD (0 = solid, 1 = fully dissolved).

const NOISE = `
float dh(vec3 p){ p=fract(p*0.3183099+vec3(0.1,0.2,0.3)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
 return mix(mix(mix(dh(i),dh(i+vec3(1,0,0)),f.x),mix(dh(i+vec3(0,1,0)),dh(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(dh(i+vec3(0,0,1)),dh(i+vec3(1,0,1)),f.x),mix(dh(i+vec3(0,1,1)),dh(i+vec3(1,1,1)),f.x),f.y),f.z); }
float dnoise(vec3 p){ float n=0.62*vn(p*1.3)+0.38*vn(p*3.2+7.0); return n*0.78+clamp((p.y+2.4)/3.9,0.0,1.0)*0.22; }
`;

export const PALETTES = {
  anatomico: { tissue: '#e0807c', sheen: '#ffd3cf', inner: '#c35a5d', cap: '#e38c86', endo: '#b93d52', cav: '#7a1f31', ovary: '#f0bfae' },
  lavanda: { tissue: '#b3a4e4', sheen: '#e7e5fe', inner: '#8a7bcc', cap: '#ada0de', endo: '#6c5cb6', cav: '#332b66', ovary: '#d6cdf4' }
};

// Endometriosis page modes -> design "Tipo" (0 = healthy anatomy)
export const MODE_TYPE = { anatomia: 0, superficial: 1, ovarica: 2, profunda: 3, adherencias: 4 };

export function createDesignModel(renderer, { tone = 'anatomico' } = {}) {
  const T = THREE;
  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  // studio environment (used as envMap on every physical material)
  const pm = new T.PMREMGenerator(renderer);
  const es = new T.Scene();
  es.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x1b1d2c, side: T.BackSide })));
  const panel = (c, i, p, s) => { const m = new T.Mesh(new T.PlaneGeometry(s[0], s[1]), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(i), side: T.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); es.add(m); };
  panel(0xffffff, 3, [0, 8, 6], [10, 4]); panel(0xffd9d4, 2, [8, 2, 3], [4, 8]); panel(0x9184d9, 3, [-8, 1, -4], [4, 8]); panel(0xffffff, 1.2, [-5, -4, 6], [6, 3]);
  const envTex = keep(pm.fromScene(es, 0.04).texture);
  es.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  pm.dispose();

  const U = { uD: { value: 1 }, uEdge: { value: new T.Color(0xb5abfc) } };
  const patch = (m) => {
    m.envMap = envTex;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uD = U.uD; sh.uniforms.uEdge = U.uEdge;
      sh.vertexShader = 'varying vec3 vLp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLp = position;');
      sh.fragmentShader = 'varying vec3 vLp;\nuniform float uD;\nuniform vec3 uEdge;\n' + NOISE + sh.fragmentShader
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat dN = dnoise(vLp); float dT = mix(-0.02, 1.4, uD); if (dN < dT) discard;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nif (uD > 0.001) { float dE = 1.0 - smoothstep(dT, dT + 0.06, dN); gl_FragColor.rgb += uEdge * dE * 2.4; }');
    };
    return keep(m);
  };

  const localClip = new T.Plane(new T.Vector3(0, 0, -1), 2);
  const clip = new T.Plane().copy(localClip);
  const phys = (o) => patch(new T.MeshPhysicalMaterial(Object.assign({ roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 1, sheenRoughness: 0.45, envMapIntensity: 0.75 }, o)));

  const mTissue = phys({});
  const mShell = phys({ clippingPlanes: [clip] });
  const mShellIn = phys({ side: T.BackSide, clippingPlanes: [clip], roughness: 0.6, clearcoat: 0 });
  const mCav = phys({ side: T.DoubleSide, clippingPlanes: [clip], roughness: 0.5, clearcoat: 0.3 });
  const mVag = phys({ side: T.DoubleSide, clippingPlanes: [clip] });
  const mOv = phys({ roughness: 0.55, clearcoat: 0.3, transparent: true });
  const fiber = (base, n, vertical) => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    const col = new T.Color(base);
    for (let i = 0; i < n; i++) {
      const l = Math.random() < 0.5 ? col.clone().lerp(new T.Color(1, 1, 1), 0.35) : col.clone().multiplyScalar(0.7);
      g.strokeStyle = `rgba(${l.r * 255 | 0},${l.g * 255 | 0},${l.b * 255 | 0},${0.1 + Math.random() * 0.18})`;
      g.lineWidth = 0.6 + Math.random() * 2.2;
      const x = Math.random() * 512, y = Math.random() * 512, L = 40 + Math.random() * 140, a = vertical ? Math.PI / 2 + (Math.random() - 0.5) * 0.4 : Math.random() * Math.PI;
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + (Math.random() - 0.5) * 30, y + Math.sin(a) * L * 0.5 + (Math.random() - 0.5) * 30, x + Math.cos(a) * L, y + Math.sin(a) * L);
      g.stroke();
    }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(0.5, 0.5); t.anisotropy = 4; return keep(t);
  };
  const mCap = patch(new T.MeshStandardMaterial({ roughness: 0.72, side: T.DoubleSide }));
  const mEndo = patch(new T.MeshStandardMaterial({ roughness: 0.55, side: T.DoubleSide }));
  const mGhost = patch(new T.MeshPhysicalMaterial({ color: 0xb2b6ca, roughness: 0.3, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, envMapIntensity: 0.6 }));
  const mLes = patch(new T.MeshStandardMaterial({ color: 0x5d5294, emissive: 0x9184d9, emissiveIntensity: 1, roughness: 0.35 }));
  const mAdh = patch(new T.MeshStandardMaterial({ color: 0xd2cefd, emissive: 0x9184d9, emissiveIntensity: 0.7, transparent: true, opacity: 0, depthWrite: false }));
  const mOma = patch(new T.MeshStandardMaterial({ color: 0x2b2741, emissive: 0x423a6a, emissiveIntensity: 0.8, roughness: 0.25 }));

  const p = PALETTES[tone] || PALETTES.anatomico;
  [mTissue, mShell, mVag].forEach(m => { m.color.set(p.tissue); m.sheenColor.set(p.sheen); });
  mShellIn.color.set(p.inner); mShellIn.sheenColor.set(p.sheen);
  mCav.color.set(p.cav); mCav.sheenColor.set(p.endo);
  mOv.color.set(p.ovary); mOv.sheenColor.set('#fff4ee');
  mCap.map = fiber(p.cap, 900, false); mEndo.map = fiber(p.endo, 700, true);

  // ---------- geometry (all baked in model-local coords) ----------
  const root = new T.Group(); root.name = 'Sistema_reproductor';
  const inner = new T.Group(); inner.position.y = 0.42; root.add(inner);
  const V2 = (a) => a.map(([r, y]) => new T.Vector2(r, y));
  const smooth = (a, n) => new T.SplineCurve(V2(a)).getPoints(n);
  const SX = 1.12, SZ = 0.64;
  const outer = smooth([[0.001, -0.86], [0.2, -0.85], [0.33, -0.78], [0.36, -0.55], [0.35, -0.3], [0.4, -0.05], [0.55, 0.25], [0.74, 0.6], [0.88, 0.92], [0.92, 1.12], [0.85, 1.3], [0.62, 1.44], [0.3, 1.5], [0.001, 1.52]], 90);
  const cavP = smooth([[0.001, -0.84], [0.06, -0.82], [0.07, -0.5], [0.08, -0.15], [0.2, 0.3], [0.42, 0.8], [0.62, 1.1], [0.58, 1.18], [0.3, 1.22], [0.001, 1.23]], 80);
  const rAt = (pts, y) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); } return 0; };
  const add = (geo, mat, parent = inner) => { keep(geo); const m = new T.Mesh(geo, mat); parent.add(m); return m; };

  const shellG = new T.LatheGeometry(outer, 96); shellG.scale(SX, 1, SZ);
  add(shellG, mShell); add(shellG, mShellIn);
  const cavG = new T.LatheGeometry(cavP, 72); cavG.scale(SX, 1, 0.34);
  { const q = cavG.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i); const a = Math.atan2(z, x); const d = 1 + 0.06 * Math.sin(y * 34 + a * 3); q.setX(i, x * d); q.setZ(i, z * d); } cavG.computeVertexNormals(); }
  add(cavG, mCav);

  // vagina: thick-walled lathe with rugae on the inside
  const vOuter = smooth([[0.56, -0.42], [0.55, -0.7], [0.46, -1.1], [0.42, -1.6], [0.42, -2.1], [0.44, -2.38]], 40);
  const vIn = [];
  const inTab = [[-2.36, 0.35], [-1.6, 0.3], [-1.1, 0.33], [-0.78, 0.44], [-0.55, 0.42]];
  const inR = (y) => { for (let i = 0; i < inTab.length - 1; i++) { const [y0, r0] = inTab[i], [y1, r1] = inTab[i + 1]; if (y >= y0 && y <= y1) { const t = (y - y0) / (y1 - y0); return r0 + (r1 - r0) * (t * t * (3 - 2 * t)); } } return 0.35; };
  for (let k = 0; k <= 140; k++) { const y = -2.36 + k * (1.8 / 140); vIn.push(new T.Vector2(inR(y) + 0.013 * Math.sin(y * 58), y)); }
  const vLoop = [...vOuter, new T.Vector2(0.37, -2.4), ...vIn, new T.Vector2(0.4, -0.45), new T.Vector2(0.56, -0.42)];
  const vagG = new T.LatheGeometry(vLoop, 80); vagG.scale(1, 1, 0.74);
  add(vagG, mVag);

  // section caps (the cut face)
  const sil = (pts, sx, grow = 0, fr = 0) => {
    const R = pts.map((q, i) => new T.Vector2(Math.max(0.0005, q.x * sx + grow + (fr ? fr * Math.max(0, Math.sin(i * 1.9)) : 0)), q.y + (q.y > 1 ? grow : 0)));
    return [...R, ...R.slice().reverse().map(q => new T.Vector2(-q.x, q.y))];
  };
  const capShape = new T.Shape(sil(outer, SX));
  const endoOut = sil(cavP, SX, 0.075, 0.018);
  capShape.holes.push(new T.Path(endoOut));
  const capG = new T.ShapeGeometry(capShape, 1); capG.translate(0, 0, 0.004); add(capG, mCap);
  const endoShape = new T.Shape(endoOut); endoShape.holes.push(new T.Path(sil(cavP, SX)));
  const endoG = new T.ShapeGeometry(endoShape, 1); endoG.translate(0, 0, 0.005); add(endoG, mEndo);
  [1, -1].forEach(s => { const g = new T.ShapeGeometry(new T.Shape(vLoop.map(q => new T.Vector2(q.x * s, q.y)))); g.translate(0, 0, 0.004); add(g, mCap); });

  // tapered tube helper
  const tube = (pts, seg, rad, fn) => {
    const c = new T.CatmullRomCurve3(pts.map(q => new T.Vector3(...q)));
    const g = new T.TubeGeometry(c, seg, 1, rad, false);
    const q = g.attributes.position, P = new T.Vector3(), v = new T.Vector3();
    for (let i = 0; i <= seg; i++) { c.getPointAt(i / seg, P); const f = fn(i / seg); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(q, k).sub(P).multiplyScalar(f).add(P); q.setXYZ(k, v.x, v.y, v.z); } }
    g.computeVertexNormals(); return { g, c };
  };
  const tubesG = [], fimbG = [], ovG = [];
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const ovC = [];
  [1, -1].forEach(s => {
    const { g, c } = tube([[0.95, 1.08, 0], [1.35, 1.25, 0.02], [1.85, 1.38, 0.05], [2.35, 1.35, 0.08], [2.72, 1.12, 0.1], [2.9, 0.75, 0.08], [2.85, 0.38, 0.04], [2.7, 0.12, 0]].map(([x, y, z]) => [x * s, y, z]), 180, 18,
      t => 0.062 + 0.03 * Math.sin(Math.min(t, 0.7) / 0.7 * Math.PI / 2) + (t > 0.78 ? Math.pow((t - 0.78) / 0.22, 2) * 0.08 : 0));
    add(g, mTissue); tubesG.push(g);
    const E = c.getPointAt(1), D = c.getTangentAt(1);
    const side = new T.Vector3(1, 0, 0).cross(D).normalize(), up2 = D.clone().cross(side).normalize();
    for (let k = 0; k < 11; k++) {
      const a = (k / 11) * Math.PI * 2, o = side.clone().multiplyScalar(Math.cos(a) * 0.14).add(up2.clone().multiplyScalar(Math.sin(a) * 0.14));
      const st = E.clone().add(o);
      const spread = o.clone().normalize().multiplyScalar(0.12 + rnd() * 0.1);
      const L = 0.22 + rnd() * 0.22;
      const p1 = st.clone().add(D.clone().multiplyScalar(L * 0.5)).add(spread);
      const p2 = st.clone().add(D.clone().multiplyScalar(L)).add(spread.clone().multiplyScalar(1.9)).add(new T.Vector3(s * 0.06 * rnd(), -0.05 * rnd(), 0));
      const f = tube([st.toArray(), p1.toArray(), p2.toArray()], 20, 7, t => 0.036 - 0.02 * t);
      add(f.g, mTissue); fimbG.push(f.g);
      const tip = new T.SphereGeometry(0.017, 10, 8); tip.translate(p2.x, p2.y, p2.z); add(tip, mTissue);
    }
    // ovary with follicle bumps
    const oc = new T.Vector3(2.0 * s, 0.16, 0.08); ovC.push(oc);
    const og = new T.SphereGeometry(1, 96, 64);
    const fol = Array.from({ length: 34 }, () => ({ d: new T.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize(), r: 0.22 + rnd() * 0.24, h: 0.05 + rnd() * 0.06 }));
    const op = og.attributes.position, v = new T.Vector3();
    for (let i = 0; i < op.count; i++) { v.fromBufferAttribute(op, i); let b = 0; for (const f of fol) { const ang = v.angleTo(f.d); if (ang < f.r) { const q = 1 - ang / f.r; b += f.h * Math.sqrt(q); } } v.multiplyScalar(1 + b); op.setXYZ(i, v.x, v.y, v.z); }
    og.scale(0.44, 0.32, 0.3); og.rotateZ(-0.25 * s); og.translate(oc.x, oc.y, oc.z); og.computeVertexNormals();
    add(og, mOv); ovG.push(og);
    const lig = tube([[1.62 * s, 0.24, 0.02], [1.3 * s, 0.4, 0], [0.86 * s, 0.62, -0.06]], 30, 10, () => 0.05); add(lig.g, mTissue);
  });

  // neighbour organs (ghosted)
  const bladG = new T.SphereGeometry(1, 48, 32); bladG.scale(0.95, 0.6, 0.6); bladG.translate(0, -1.02, 1.05); add(bladG, mGhost);
  const rect = tube([[0.15, -2.45, -0.95], [0.1, -1.4, -1.05], [0.25, -0.4, -1.05], [0.7, 0.5, -0.85], [1.35, 0.9, -0.55]], 80, 20, t => 0.3 - 0.04 * t); add(rect.g, mGhost);

  // lesions
  const lesions = [];
  const lesionG = keep(new T.SphereGeometry(1, 16, 12));
  const addLes = (pos, size, types) => { const m = new T.Mesh(lesionG, mLes); m.position.copy(pos); m.scale.setScalar(0.0001); m.userData = { size, types, cur: 0, ph: rnd() * 6 }; inner.add(m); lesions.push(m); };
  const surf = (y, th, off = 0.015) => { const r = rAt(outer, y); const n = new T.Vector3(Math.cos(th) / SX, 0, Math.sin(th) / SZ).normalize(); return new T.Vector3(r * SX * Math.cos(th), y, r * SZ * Math.sin(th)).add(n.multiplyScalar(off)); };
  [[0.9, 1.1], [0.3, 2.0], [0.5, 0.7], [-0.2, 1.4], [1.2, 0.9], [-0.1, 0.45], [0.1, 2.6], [1.05, 2.3], [0.62, 1.55]].forEach(([y, th], i) => addLes(surf(y, th), 0.045 + (i % 3) * 0.015, [1, 3, 4]));
  const ovPt = (o, d) => o.clone().add(new T.Vector3(d[0] * 0.46, d[1] * 0.34, d[2] * 0.32));
  [[ovC[0], [0.3, 0.6, 0.75]], [ovC[1], [-0.5, 0.4, 0.8]], [ovC[0], [-0.6, -0.4, 0.7]], [ovC[1], [0.4, -0.5, 0.75]]].forEach(([o, d], i) => addLes(ovPt(o, d), 0.05, i < 2 ? [1, 2, 4] : [2, 4]));
  [[-0.3, -0.5, 0.52], [0.35, -0.52, 0.5], [0.0, -0.46, 0.55], [0.3, -0.95, -0.72], [0.12, -0.2, -0.72], [0.6, -0.3, -0.32]].forEach((q, i) => addLes(new T.Vector3(...q), 0.055 + (i % 2) * 0.02, [3, 4]));
  const omaG = new T.SphereGeometry(0.19, 32, 24); omaG.translate(ovC[0].x, ovC[0].y, ovC[0].z); const oma = add(omaG, mOma); oma.scale.setScalar(0.0001);
  const adhG = [
    [[0.3, -0.35, -0.5], [0.25, -0.5, -0.75], [0.2, -0.7, -0.8]],
    [[-0.3, -0.5, 0.5], [-0.25, -0.55, 0.65], [-0.2, -0.62, 0.75]],
    [[-0.75, 0.3, 0.1], [-1.2, 0.3, 0.2], [-1.62, 0.25, 0.2]],
    [[2.55, 0.35, 0.1], [2.4, 0.25, 0.25], [2.25, 0.2, 0.3]],
    [[0.75, 0.2, -0.3], [0.9, 0.3, -0.55], [1.0, 0.55, -0.7]]
  ].map(pts => add(tube(pts, 24, 6, () => 0.012).g, mAdh));

  // dissolve particles, seeded from the model surface
  const sample = (geo, n, P, Dn) => {
    const q = geo.attributes.position, idx = geo.index; const tri = (idx ? idx.count : q.count) / 3; const gi = i => idx ? idx.getX(i) : i;
    const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), e1 = new T.Vector3(), e2 = new T.Vector3(); const A = new Float32Array(tri); let tot = 0;
    for (let i = 0; i < tri; i++) { a.fromBufferAttribute(q, gi(3 * i)); b.fromBufferAttribute(q, gi(3 * i + 1)); c.fromBufferAttribute(q, gi(3 * i + 2)); tot += e1.subVectors(b, a).cross(e2.subVectors(c, a)).length() * 0.5; A[i] = tot; }
    for (let k = 0; k < n; k++) {
      const r = Math.random() * tot; let lo = 0, hi = tri - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (A[m] < r) lo = m + 1; else hi = m; }
      a.fromBufferAttribute(q, gi(3 * lo)); b.fromBufferAttribute(q, gi(3 * lo + 1)); c.fromBufferAttribute(q, gi(3 * lo + 2));
      let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      const x = a.x + (b.x - a.x) * u + (c.x - a.x) * v, y = a.y + (b.y - a.y) * u + (c.y - a.y) * v, z = a.z + (b.z - a.z) * u + (c.z - a.z) * v;
      P.push(x, y, z);
      const d = new T.Vector3(x, y + 0.4, z).normalize().multiplyScalar(0.7).add(new T.Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5)).normalize();
      Dn.push(d.x, d.y, d.z);
    }
  };
  const PP = [], PD = [];
  sample(shellG, 1500, PP, PD); sample(vagG, 500, PP, PD); tubesG.forEach(g => sample(g, 380, PP, PD)); ovG.forEach(g => sample(g, 280, PP, PD)); fimbG.forEach(g => sample(g, 14, PP, PD));
  const pg = keep(new T.BufferGeometry());
  pg.setAttribute('position', new T.Float32BufferAttribute(PP, 3));
  pg.setAttribute('aDir', new T.Float32BufferAttribute(PD, 3));
  pg.setAttribute('aR', new T.Float32BufferAttribute(Array.from({ length: PP.length / 3 }, Math.random), 1));
  const pMat = keep(new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uD: U.uD, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, cA: { value: new T.Color(0xd9667a) }, cB: { value: new T.Color(0x8e6cc9) } },
    vertexShader: `attribute vec3 aDir; attribute float aR; uniform float uD; uniform float uTime; uniform float uPx; varying float vA; varying float vM;
${NOISE}
void main(){ float n=dnoise(position); float dT=mix(-0.02,1.4,uD); float t=clamp((dT-n)/0.38,0.0,1.0);
 vec3 p=position+aDir*t*(0.5+aR*1.5)+vec3(sin(uTime*0.9+aR*30.0)*0.06*t, t*t*(0.9+aR*0.8), 0.0);
 vA=(dT>n?1.0:0.0)*(1.0-t)*(0.55+aR*0.45); vM=aR;
 vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=uPx*(2.2+aR*4.0)*(11.0/-mv.z); }`,
    fragmentShader: `uniform vec3 cA; uniform vec3 cB; varying float vA; varying float vM;
void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; float a=smoothstep(0.5,0.0,d)*vA; gl_FragColor=vec4(mix(cA,cB,vM),a); }`
  }));
  const points = new T.Points(pg, pMat); points.frustumCulled = false; inner.add(points);

  // ---------- animation state ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const cur = { cut: 1, rb: 0, ghost: 0, adh: 0, ov: 1, oma: 0 };

  // Called every frame; the caller's group handles position, scale, sway and parallax.
  function update({ time, introTime = time, dt, reduced, type = 0, cut = true, dissolve = 0 }) {
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2), k2 = reduced ? 1 : 1 - Math.exp(-dt * 6);
    const tg = {
      cut: cut ? 1 : 0,
      rb: type >= 3 ? -0.6 : type ? -0.12 : 0,
      ghost: type >= 3 ? 0.2 : 0,
      adh: type === 4 ? 0.85 : 0,
      ov: type === 2 || type === 4 ? 0.42 : 1,
      oma: type === 2 || type === 4 ? 1 : 0
    };
    ['rb', 'ghost', 'adh', 'ov', 'oma'].forEach(n => { cur[n] += (tg[n] - cur[n]) * k; });
    cur.cut += (tg.cut - cur.cut) * (reduced ? 1 : 1 - Math.exp(-dt * 2.4));

    // materialize from particles on load, dissolve back when asked (scroll)
    const intro = reduced ? 0 : clamp(1 - (introTime - 0.3) / 3, 0, 1);
    U.uD.value = Math.max(intro * intro * (3 - 2 * intro), dissolve);
    pMat.uniforms.uTime.value = time;

    inner.rotation.y = cur.rb;
    inner.updateWorldMatrix(true, false);
    localClip.constant = (1 - cur.cut) * 2.2 - 0.0005;
    clip.copy(localClip).applyMatrix4(inner.matrixWorld);

    mGhost.opacity = cur.ghost; mGhost.visible = cur.ghost > 0.005;
    mAdh.opacity = cur.adh; adhG.forEach(m => { m.visible = cur.adh > 0.005; });
    mOv.opacity = cur.ov; mOv.depthWrite = cur.ov > 0.95;
    oma.scale.setScalar(Math.max(0.0001, cur.oma)); oma.visible = cur.oma > 0.01;
    lesions.forEach(m => {
      const u = m.userData; u.cur += ((u.types.includes(type) ? 1 : 0) - u.cur) * k2;
      m.visible = u.cur > 0.01; m.scale.setScalar(Math.max(0.0001, u.cur * u.size * (1 + (reduced ? 0 : 0.12 * Math.sin(time * 2.2 + u.ph)))));
    });
    mLes.emissiveIntensity = 0.9 + (reduced ? 0 : 0.35 * Math.sin(time * 2.2));
  }

  function dispose() { disposables.forEach(d => d.dispose?.()); }

  return { object: root, update, dispose };
}
