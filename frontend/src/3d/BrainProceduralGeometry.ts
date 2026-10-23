/**
 * SynapseLab 3D - Procedural Anatomical Brain Architecture
 * Mathematically generates authentic cortical gyri/sulci, subcortical nuclei,
 * cerebellar folia, brainstem, tractography fiber bundles, and 10-20 EEG electrode cap.
 */

import * as THREE from 'three';
import { BrainRegionId } from '../types/neuroscience.ts';

export interface AnatomicalMeshDefinition {
  id: BrainRegionId;
  group: THREE.Group;
  primaryMesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  explodedOffset: THREE.Vector3;
  baseColor: THREE.Color;
  activeColor: THREE.Color;
  material: THREE.MeshPhysicalMaterial;
}

/**
 * Procedural biological cortical folding formula
 * Simulates gyral crests and sulcal troughs via harmonic multi-frequency deformation
 */
function applyCorticalFoldDeformation(
  geometry: THREE.BufferGeometry,
  frequencyScale: number = 1.0,
  roughnessAmp: number = 0.08
) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Spherical angles
    const radius = v.length();
    const theta = Math.atan2(v.z, v.x);
    const phi = Math.acos(THREE.MathUtils.clamp(v.y / (radius || 1), -1, 1));

    // Multi-frequency spherical harmonics for gyri and sulci
    const gyrus1 = Math.sin(phi * 7.5 * frequencyScale) * Math.cos(theta * 6.0 * frequencyScale);
    const gyrus2 = Math.sin(phi * 14.0 * frequencyScale + 1.2) * Math.cos(theta * 12.0 * frequencyScale);
    const sulcusDeep = Math.sin(theta * 2.0) * Math.cos(phi * 3.0);

    // Hemispheric sagittal fissure indentation near x = 0
    const fissureIndent = Math.exp(-Math.pow(v.x * 2.8, 2)) * 0.12;

    const foldDisplacement = (gyrus1 * 0.05 + gyrus2 * 0.025 + sulcusDeep * 0.03 - fissureIndent) * roughnessAmp * 10;
    const newRadius = radius + foldDisplacement;

    v.normalize().multiplyScalar(newRadius);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geometry.computeVertexNormals();
}

/**
 * Creates an anatomical lobe with dual hemispheres (left & right)
 */
function createCorticalLobe(
  id: BrainRegionId,
  scale: [number, number, number],
  posOffset: [number, number, number],
  explodedDir: [number, number, number],
  colorHex: string,
  foldFreq: number = 1.0
): AnatomicalMeshDefinition {
  const group = new THREE.Group();
  group.name = `lobe_${id}`;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    transmission: 0.0,
    transparent: true,
    opacity: 0.94,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0,
  });

  // Left Hemisphere lobe
  const geomLeft = new THREE.SphereGeometry(0.72, 48, 48);
  geomLeft.scale(scale[0] * 0.48, scale[1] * 0.5, scale[2] * 0.5);
  applyCorticalFoldDeformation(geomLeft, foldFreq, 0.06);
  const meshLeft = new THREE.Mesh(geomLeft, material);
  meshLeft.position.set(-scale[0] * 0.38, 0, 0);
  meshLeft.castShadow = true;
  meshLeft.receiveShadow = true;
  meshLeft.userData = { regionId: id, partName: `${id}_left` };

  // Right Hemisphere lobe
  const geomRight = new THREE.SphereGeometry(0.72, 48, 48);
  geomRight.scale(scale[0] * 0.48, scale[1] * 0.5, scale[2] * 0.5);
  applyCorticalFoldDeformation(geomRight, foldFreq, 0.06);
  const meshRight = new THREE.Mesh(geomRight, material);
  meshRight.position.set(scale[0] * 0.38, 0, 0);
  meshRight.castShadow = true;
  meshRight.receiveShadow = true;
  meshRight.userData = { regionId: id, partName: `${id}_right` };

  group.add(meshLeft);
  group.add(meshRight);

  const basePos = new THREE.Vector3(...posOffset);
  group.position.copy(basePos);

  return {
    id,
    group,
    primaryMesh: meshLeft,
    basePosition: basePos,
    explodedOffset: new THREE.Vector3(...explodedDir),
    baseColor: new THREE.Color(colorHex),
    activeColor: new THREE.Color(colorHex).offsetHSL(0, 0.2, 0.2),
    material,
  };
}

/**
 * Creates Cerebellum with distinct horizontal folia ridges and arbor vitae symmetry
 */
function createCerebellum(): AnatomicalMeshDefinition {
  const group = new THREE.Group();
  group.name = 'lobe_cerebellum';

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#14b8a6'),
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.25,
    transparent: true,
    opacity: 0.95,
  });

  // Cerebellar Hemisphere geometry with fine horizontal folia waves
  const createHemisphere = (sign: number) => {
    const geom = new THREE.SphereGeometry(0.55, 42, 42);
    geom.scale(0.85, 0.55, 0.65);
    const pos = geom.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // High-frequency horizontal folia ridges characteristic of cerebellar cortex
      const foliaRipples = Math.sin(v.y * 28.0) * 0.025;
      v.x += foliaRipples * Math.sign(v.x);
      v.z += foliaRipples;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(sign * 0.36, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { regionId: 'cerebellum', partName: `cerebellum_${sign > 0 ? 'right' : 'left'}` };
    return mesh;
  };

  // Central Vermis uniting both hemispheres
  const vermisGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.65, 24);
  vermisGeom.rotateX(Math.PI * 0.2);
  const vermisMesh = new THREE.Mesh(vermisGeom, material);
  vermisMesh.position.set(0, 0.02, 0.05);
  vermisMesh.castShadow = true;
  vermisMesh.userData = { regionId: 'cerebellum', partName: 'vermis' };

  group.add(createHemisphere(-1));
  group.add(createHemisphere(1));
  group.add(vermisMesh);

  const basePos = new THREE.Vector3(0, -0.78, -1.05);
  group.position.copy(basePos);

  return {
    id: 'cerebellum',
    group,
    primaryMesh: vermisMesh,
    basePosition: basePos,
    explodedOffset: new THREE.Vector3(0, -0.6, -0.8),
    baseColor: new THREE.Color('#14b8a6'),
    activeColor: new THREE.Color('#2dd4bf'),
    material,
  };
}

/**
 * Creates Brainstem (Midbrain, Pons with transverse fibers, and Medulla Oblongata)
 */
function createBrainstem(): AnatomicalMeshDefinition {
  const group = new THREE.Group();
  group.name = 'lobe_brainstem';

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#64748b'),
    roughness: 0.5,
    metalness: 0.1,
    clearcoat: 0.2,
    transparent: true,
    opacity: 0.95,
  });

  // Pons bulge
  const ponsGeom = new THREE.SphereGeometry(0.32, 24, 24);
  ponsGeom.scale(0.85, 0.65, 0.7);
  const ponsMesh = new THREE.Mesh(ponsGeom, material);
  ponsMesh.position.set(0, 0.18, 0.12);
  ponsMesh.castShadow = true;
  ponsMesh.userData = { regionId: 'brainstem', partName: 'pons' };

  // Medulla cylinder transitioning down
  const medullaGeom = new THREE.CylinderGeometry(0.20, 0.15, 0.75, 24);
  const medullaMesh = new THREE.Mesh(medullaGeom, material);
  medullaMesh.position.set(0, -0.32, 0.02);
  medullaMesh.castShadow = true;
  medullaMesh.userData = { regionId: 'brainstem', partName: 'medulla' };

  group.add(ponsMesh);
  group.add(medullaMesh);

  const basePos = new THREE.Vector3(0, -1.05, -0.2);
  group.position.copy(basePos);

  return {
    id: 'brainstem',
    group,
    primaryMesh: ponsMesh,
    basePosition: basePos,
    explodedOffset: new THREE.Vector3(0, -0.9, 0),
    baseColor: new THREE.Color('#64748b'),
    activeColor: new THREE.Color('#94a3b8'),
    material,
  };
}

/**
 * Creates Subcortical Deep Nuclei: Thalamus, Hypothalamus, Hippocampus, Amygdala, VTA
 */
function createSubcorticalStructure(
  id: BrainRegionId,
  colorHex: string,
  baseCoords: [number, number, number],
  explodedDir: [number, number, number],
  shapeType: 'thalamus' | 'hypothalamus' | 'hippocampus' | 'amygdala' | 'vta'
): AnatomicalMeshDefinition {
  const group = new THREE.Group();
  group.name = `subcortical_${id}`;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 0.4,
    transparent: true,
    opacity: 0.92,
  });

  let primaryMesh: THREE.Mesh;

  if (shapeType === 'thalamus') {
    // Bilateral ovoid bodies
    const eggGeom = new THREE.SphereGeometry(0.24, 24, 24);
    eggGeom.scale(0.7, 0.9, 1.25);
    const leftThal = new THREE.Mesh(eggGeom, material);
    leftThal.position.set(-0.25, 0, 0);
    const rightThal = new THREE.Mesh(eggGeom, material);
    rightThal.position.set(0.25, 0, 0);
    leftThal.userData = { regionId: id, partName: 'thalamus_left' };
    rightThal.userData = { regionId: id, partName: 'thalamus_right' };
    group.add(leftThal);
    group.add(rightThal);
    primaryMesh = leftThal;
  } else if (shapeType === 'hippocampus') {
    // Curved C-shaped seahorse tubes
    const curveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.45, -0.2, 0.4),
      new THREE.Vector3(-0.65, -0.3, 0.0),
      new THREE.Vector3(-0.55, -0.35, -0.4),
    ]);
    const tubeGeomLeft = new THREE.TubeGeometry(curveLeft, 20, 0.09, 12, false);
    const meshLeft = new THREE.Mesh(tubeGeomLeft, material);
    meshLeft.userData = { regionId: id, partName: 'hippocampus_left' };

    const curveRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.45, -0.2, 0.4),
      new THREE.Vector3(0.65, -0.3, 0.0),
      new THREE.Vector3(0.55, -0.35, -0.4),
    ]);
    const tubeGeomRight = new THREE.TubeGeometry(curveRight, 20, 0.09, 12, false);
    const meshRight = new THREE.Mesh(tubeGeomRight, material);
    meshRight.userData = { regionId: id, partName: 'hippocampus_right' };

    group.add(meshLeft);
    group.add(meshRight);
    primaryMesh = meshLeft;
  } else if (shapeType === 'amygdala') {
    // Almond-shaped bilateral nuclei anterior to hippocampus
    const almondGeom = new THREE.SphereGeometry(0.14, 18, 18);
    almondGeom.scale(1.2, 0.9, 1.4);
    const leftAmy = new THREE.Mesh(almondGeom, material);
    leftAmy.position.set(-0.45, 0, 0);
    const rightAmy = new THREE.Mesh(almondGeom, material);
    rightAmy.position.set(0.45, 0, 0);
    leftAmy.userData = { regionId: id, partName: 'amygdala_left' };
    rightAmy.userData = { regionId: id, partName: 'amygdala_right' };
    group.add(leftAmy);
    group.add(rightAmy);
    primaryMesh = leftAmy;
  } else if (shapeType === 'vta') {
    // Ventral Tegmental Area & Nucleus Accumbens cluster
    const nucGeom = new THREE.SphereGeometry(0.16, 20, 20);
    const vtaCenter = new THREE.Mesh(nucGeom, material);
    vtaCenter.position.set(0, 0, -0.1);
    const nAcLeft = new THREE.Mesh(nucGeom, material);
    nAcLeft.position.set(-0.35, 0.15, 0.25);
    const nAcRight = new THREE.Mesh(nucGeom, material);
    nAcRight.position.set(0.35, 0.15, 0.25);
    vtaCenter.userData = { regionId: id, partName: 'vta_dopamine_core' };
    nAcLeft.userData = { regionId: id, partName: 'nucleus_accumbens_left' };
    nAcRight.userData = { regionId: id, partName: 'nucleus_accumbens_right' };
    group.add(vtaCenter);
    group.add(nAcLeft);
    group.add(nAcRight);
    primaryMesh = vtaCenter;
  } else {
    // Hypothalamus
    const hypoGeom = new THREE.ConeGeometry(0.22, 0.32, 18);
    hypoGeom.rotateX(Math.PI);
    const hypoMesh = new THREE.Mesh(hypoGeom, material);
    hypoMesh.userData = { regionId: id, partName: 'hypothalamus' };
    group.add(hypoMesh);
    primaryMesh = hypoMesh;
  }

  const basePos = new THREE.Vector3(...baseCoords);
  group.position.copy(basePos);

  return {
    id,
    group,
    primaryMesh,
    basePosition: basePos,
    explodedOffset: new THREE.Vector3(...explodedDir),
    baseColor: new THREE.Color(colorHex),
    activeColor: new THREE.Color(colorHex).offsetHSL(0, 0.2, 0.2),
    material,
  };
}

/**
 * Builds the complete 12-structure procedural human brain
 */
export function buildProceduralBrain(): Record<BrainRegionId, AnatomicalMeshDefinition> {
  const parts: Partial<Record<BrainRegionId, AnatomicalMeshDefinition>> = {};

  // 1. Prefrontal Cortex (Anterior frontal pole)
  parts.pfc = createCorticalLobe('pfc', [1.3, 1.2, 1.25], [0, 0.45, 1.05], [0, 0.35, 0.9], '#38bdf8', 1.0);

  // 2. Motor Cortex (Precentral strip)
  parts.motor_cortex = createCorticalLobe('motor_cortex', [1.4, 1.1, 0.8], [0, 0.95, 0.35], [0, 0.8, 0.1], '#f59e0b', 1.1);

  // 3. Somatosensory & Parietal Cortex (Postcentral & parietal lobules)
  parts.somatosensory = createCorticalLobe('somatosensory', [1.35, 1.15, 1.1], [0, 0.85, -0.45], [0, 0.7, -0.4], '#ec4899', 1.0);

  // 4. Temporal Cortex (Lateral inferior lobes)
  parts.temporal_cortex = createCorticalLobe('temporal_cortex', [1.6, 0.85, 1.3], [0, -0.15, 0.15], [0.8, -0.2, 0.1], '#a855f7', 0.9);

  // 5. Occipital Visual Cortex (Posterior pole)
  parts.occipital_cortex = createCorticalLobe('occipital_cortex', [1.15, 1.05, 1.0], [0, 0.25, -1.35], [0, 0.2, -0.9], '#06b6d4', 1.1);

  // 6. Hippocampus
  parts.hippocampus = createSubcorticalStructure('hippocampus', '#10b981', [0, -0.32, -0.1], [0.4, -0.3, -0.1], 'hippocampus');

  // 7. Amygdala
  parts.amygdala = createSubcorticalStructure('amygdala', '#f43f5e', [0, -0.42, 0.48], [0.35, -0.3, 0.4], 'amygdala');

  // 8. Thalamus
  parts.thalamus = createSubcorticalStructure('thalamus', '#eab308', [0, -0.05, 0.0], [0, 0.2, 0], 'thalamus');

  // 9. Hypothalamus
  parts.hypothalamus = createSubcorticalStructure('hypothalamus', '#d946ef', [0, -0.48, 0.25], [0, -0.35, 0.2], 'hypothalamus');

  // 10. VTA & Nucleus Accumbens (Reward Hub)
  parts.vta_striatum = createSubcorticalStructure('vta_striatum', '#6366f1', [0, -0.52, 0.38], [0, -0.4, 0.3], 'vta');

  // 11. Cerebellum
  parts.cerebellum = createCerebellum();

  // 12. Brainstem
  parts.brainstem = createBrainstem();

  return parts as Record<BrainRegionId, AnatomicalMeshDefinition>;
}

/**
 * Creates 10-20 EEG Scalp Electrode Cap with glowing circular electrodes
 */
export function createEEG1020ElectrodeCap(channels: { name: string; coords3D: [number, number, number] }[]) {
  const capGroup = new THREE.Group();
  capGroup.name = 'eeg_electrode_cap';

  // Semi-transparent geodesic mesh cap
  const domeGeom = new THREE.SphereGeometry(1.72, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const domeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const domeMesh = new THREE.Mesh(domeGeom, domeMat);
  domeMesh.position.set(0, 0.2, 0.05);
  capGroup.add(domeMesh);

  // Electrode sensor rings
  channels.forEach((ch) => {
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(...ch.coords3D);

    const ringGeom = new THREE.RingGeometry(0.06, 0.09, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.lookAt(0, 0.2, 0);

    const coreGeom = new THREE.SphereGeometry(0.04, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);

    sensorGroup.add(ringMesh);
    sensorGroup.add(coreMesh);
    sensorGroup.userData = { electrodeName: ch.name };
    capGroup.add(sensorGroup);
  });

  return capGroup;
}
