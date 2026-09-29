import * as THREE from "three";

// A stylized, front-facing anatomy study based on the client's reference.
// Every object is named so that an artist can replace it with a Blender GLB.
export function createReproductiveModel() {
  const root = new THREE.Group();
  root.name = "Sistema_reproductor";
  const rose = new THREE.MeshPhysicalMaterial({
    color: "#e8a9bb",
    roughness: 0.27,
    metalness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    sheen: 1,
    sheenColor: "#fff2e9",
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
  });
  const inner = new THREE.MeshPhysicalMaterial({
    color: "#ba7c97",
    roughness: 0.37,
    clearcoat: 0.8,
    sheen: 1,
    sheenColor: "#f7cad7",
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color: "#d9b1da",
    roughness: 0.28,
    clearcoat: 1,
    metalness: 0.05,
    sheen: 1,
    sheenColor: "#fff3ed",
  });
  const pale = new THREE.MeshPhysicalMaterial({
    color: "#e2bdcf",
    roughness: 0.4,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  function add(name, geometry, material, pos = [0, 0, 0], scale = [1, 1, 1]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    root.add(mesh);
    return mesh;
  }
  function tube(name, points, radius, mat = rose) {
    return add(
      name,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        64,
        radius,
        12,
        false,
      ),
      mat,
    );
  }
  const outline = new THREE.Shape();
  outline.moveTo(0, 1.02);
  outline.bezierCurveTo(0.48, 1.03, 0.83, 0.84, 1.04, 0.58);
  outline.bezierCurveTo(0.99, 0.29, 0.69, -0.01, 0.53, -0.39);
  outline.bezierCurveTo(0.35, -0.8, 0.25, -1.0, 0.24, -1.31);
  outline.quadraticCurveTo(0, -1.42, -0.24, -1.31);
  outline.bezierCurveTo(-0.25, -1.0, -0.35, -0.8, -0.53, -0.39);
  outline.bezierCurveTo(-0.69, -0.01, -0.99, 0.29, -1.04, 0.58);
  outline.bezierCurveTo(-0.83, 0.84, -0.48, 1.03, 0, 1.02);
  const geo = new THREE.ExtrudeGeometry(outline, {
    depth: 0.33,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.13,
    bevelThickness: 0.16,
    curveSegments: 28,
  });
  geo.computeVertexNormals();
  add("Utero", geo, rose, [0, 0.15, -0.24]);
  const cavity = new THREE.Shape();
  cavity.moveTo(-0.77, 0.58);
  cavity.bezierCurveTo(-0.37, 0.7, 0.37, 0.7, 0.77, 0.58);
  cavity.bezierCurveTo(0.56, 0.44, 0.27, 0.09, 0.15, -0.61);
  cavity.lineTo(0.1, -1.08);
  cavity.quadraticCurveTo(0, -1.15, -0.1, -1.08);
  cavity.lineTo(-0.15, -0.61);
  cavity.bezierCurveTo(-0.27, 0.09, -0.56, 0.44, -0.77, 0.58);
  add(
    "Cavidad_uterina",
    new THREE.ExtrudeGeometry(cavity, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSize: 0.045,
      bevelThickness: 0.035,
      bevelSegments: 3,
      curveSegments: 28,
    }),
    inner,
    [0, 0.15, 0.275],
  );
  const lining = new THREE.MeshPhysicalMaterial({
    color: "#f8d4d7",
    roughness: 0.4,
    clearcoat: 0.7,
  });
  tube(
    "Endometrio_izquierdo",
    [
      [-0.77, 0.73, 0.37],
      [-0.47, 0.4, 0.39],
      [-0.27, -0.07, 0.4],
      [-0.15, -0.62, 0.4],
      [-0.09, -0.94, 0.4],
    ],
    0.038,
    lining,
  );
  tube(
    "Endometrio_derecho",
    [
      [0.77, 0.73, 0.37],
      [0.47, 0.4, 0.39],
      [0.27, -0.07, 0.4],
      [0.15, -0.62, 0.4],
      [0.09, -0.94, 0.4],
    ],
    0.038,
    lining,
  );
  tube(
    "Endometrio_fondo",
    [
      [-0.74, 0.76, 0.36],
      [0, 0.81, 0.37],
      [0.74, 0.76, 0.36],
    ],
    0.035,
    lining,
  );
  add(
    "Cervix",
    new THREE.CylinderGeometry(0.2, 0.28, 0.62, 40, 1, true),
    rose,
    [0, -1.38, 0],
    [1, 1, 0.72],
  );
  for (const s of [-1, 1]) {
    const side = s === -1 ? "L" : "R";
    tube(
      `Trompa_${side}`,
      [
        [s * 0.85, 0.76, 0],
        [s * 1.3, 0.8, -0.03],
        [s * 1.91, 1.1, -0.02],
        [s * 2.47, 1.14, 0.01],
        [s * 2.78, 0.85, 0.03],
        [s * 2.77, 0.43, 0.05],
        [s * 2.53, 0.2, 0.09],
      ],
      0.105,
    );
    const ovary = add(
      `Ovario_${side}`,
      new THREE.SphereGeometry(0.38, 36, 28),
      pearl,
      [s * 2.05, -0.02, 0.05],
      [1.1, 1.15, 0.85],
    );
    for (let k = 0; k < 38; k++) {
      const y = 1 - ((k + 0.5) / 38) * 2,
        r = Math.sqrt(1 - y * y),
        a = k * 2.399963;
      const follicle = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 6),
        pearl,
      );
      follicle.position.set(
        r * Math.cos(a) * 0.365,
        y * 0.365,
        r * Math.sin(a) * 0.365,
      );
      ovary.add(follicle);
    }
    for (let k = 0; k < 6; k++)
      tube(
        `Fimbrias_${side}_${k}`,
        [
          [s * 2.55, 0.22, 0.07],
          [s * (2.4 + k * 0.085), -0.03, 0.1],
          [s * (2.22 + k * 0.12), -0.29 - (k % 3) * 0.07, 0.14],
        ],
        0.037,
      );
    tube(
      `Ligamentos_${side}`,
      [
        [s * 0.63, -0.08, -0.17],
        [s * 1.24, -0.34, -0.24],
        [s * 1.78, -0.08, -0.11],
      ],
      0.028,
      lining,
    );
  }
  const peritoneum = add(
    "Peritoneo",
    new THREE.SphereGeometry(2.48, 48, 24),
    pale,
    [0, 0.05, -0.35],
    [1.15, 0.69, 0.17],
  );
  peritoneum.visible = false;
  add(
    "Vejiga",
    new THREE.SphereGeometry(0.52, 24, 16),
    pale.clone(),
    [0.52, -1.12, -0.45],
    [1, 0.7, 0.7],
  ).visible = false;
  add(
    "Recto",
    new THREE.CapsuleGeometry(0.14, 1.25, 6, 12),
    pale.clone(),
    [-0.6, -0.68, -0.45],
  ).visible = false;
  const anchors = {
    Peritoneo: [
      [0.93, -0.28, 0.27],
      [-0.98, -0.14, 0.3],
      [1.35, -0.28, 0.15],
      [-1.39, -0.36, 0.17],
      [0.56, -0.65, 0.31],
      [-0.52, -0.66, 0.32],
      [1.54, 0.13, 0.2],
      [-1.52, 0.19, 0.16],
    ],
    Ovario_L: [
      [-2.05, 0.01, 0.4],
      [-1.85, -0.15, 0.34],
      [-2.23, 0.16, 0.35],
    ],
    Ovario_R: [
      [2.05, 0.01, 0.4],
      [1.85, -0.15, 0.34],
      [2.23, 0.16, 0.35],
    ],
    Profunda: [
      [0.5, -0.95, -0.13],
      [-0.62, -0.73, -0.12],
      [0.69, -0.74, -0.19],
      [-0.48, -1.06, -0.12],
      [0.5, -0.44, -0.1],
      [-0.43, -0.48, -0.1],
    ],
  };
  Object.entries(anchors).forEach(([name, points]) =>
    points.forEach((p, i) => {
      const a = new THREE.Object3D();
      a.name = `Anchor_${name}_${String(i + 1).padStart(2, "0")}`;
      a.position.set(...p);
      root.add(a);
    }),
  );
  return root;
}
export function disposeModel(root) {
  const gs = new Set(),
    ms = new Set();
  root.traverse((o) => {
    if (o.geometry) gs.add(o.geometry);
    if (o.material) ms.add(o.material);
  });
  gs.forEach((g) => g.dispose());
  ms.forEach((m) => m.dispose());
}
