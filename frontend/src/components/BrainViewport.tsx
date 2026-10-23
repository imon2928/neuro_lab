/**
 * SynapseLab 3D - High-Precision WebGL Three.js Brain Viewport
 * Implements real-time procedural PBR rendering, neural tractography splines,
 * action potential particle impulses, 10-20 EEG electrode cap, and exploded views.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  BrainRegionId,
  BrainRegionData,
  NeuralCircuit,
  EEGChannelData,
} from '../types/neuroscience.ts';
import {
  buildProceduralBrain,
  createEEG1020ElectrodeCap,
  AnatomicalMeshDefinition,
} from '../3d/BrainProceduralGeometry.ts';
import {
  Layers,
  Sparkles,
  Eye,
  Radio,
  RotateCcw,
} from 'lucide-react';

interface BrainViewportProps {
  regions: Record<BrainRegionId, BrainRegionData>;
  circuits: NeuralCircuit[];
  eegChannels: EEGChannelData[];
  selectedRegionId: BrainRegionId | null;
  onSelectRegion: (id: BrainRegionId | null) => void;
  language: 'en' | 'bn';
  explodedFactor: number;
  onExplodedChange: (val: number) => void;
  /** Extra card(s) rendered inside the left overlay column (below the region HUD). */
  leftPanel?: React.ReactNode;
  /** Extra card(s) rendered inside the right overlay column (below the toolbar). */
  rightPanel?: React.ReactNode;
}

export const BrainViewport: React.FC<BrainViewportProps> = ({
  regions,
  circuits,
  eegChannels,
  selectedRegionId,
  onSelectRegion,
  language,
  explodedFactor,
  onExplodedChange,
  leftPanel,
  rightPanel,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<BrainRegionId | null>(null);
  const [showTracts, setShowTracts] = useState<boolean>(true);
  const [showEEGCap, setShowEEGCap] = useState<boolean>(false);
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);

  // References for render loop mutable state
  const stateRef = useRef({
    exploded: explodedFactor,
    selectedRegionId,
    hoveredRegion,
    isXRayMode,
    isAutoRotate,
    showTracts,
    showEEGCap,
    regions,
    circuits,
  });

  useEffect(() => {
    stateRef.current.exploded = explodedFactor;
    stateRef.current.selectedRegionId = selectedRegionId;
    stateRef.current.hoveredRegion = hoveredRegion;
    stateRef.current.isXRayMode = isXRayMode;
    stateRef.current.isAutoRotate = isAutoRotate;
    stateRef.current.showTracts = showTracts;
    stateRef.current.showEEGCap = showEEGCap;
    stateRef.current.regions = regions;
    stateRef.current.circuits = circuits;
  }, [
    explodedFactor,
    selectedRegionId,
    hoveredRegion,
    isXRayMode,
    isAutoRotate,
    showTracts,
    showEEGCap,
    regions,
    circuits,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return true;
      }
    })();

    // 2. Scene & Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep cosmic dark lab background
    scene.fog = new THREE.FogExp2(0x060913, 0.08);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3.2, 2.1, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Map Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (Key, Fill, Rim, Ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    rimLight.position.set(0, -4, 3);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x0f172a, 0x030712, 1.0);
    scene.add(hemiLight);

    // Contact shadow floor circle
    const floorGeom = new THREE.CircleGeometry(3.0, 32);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.6;
    scene.add(floorMesh);

    // Grid platform rings
    const ringMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.35 });
    for (let r = 1; r <= 3; r++) {
      const ringGeom = new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, r * 0.9, 0, Math.PI * 2, true).getPoints(64)
      );
      const ring = new THREE.Line(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.59;
      scene.add(ring);
    }

    // 5. Build Procedural Anatomical Brain Safely
    const brainGroup = new THREE.Group();
    brainGroup.name = 'master_brain_group';
    scene.add(brainGroup);

    const brainParts = buildProceduralBrain() || {};
    Object.values(brainParts).forEach((part: AnatomicalMeshDefinition) => {
      if (part && part.group) {
        brainGroup.add(part.group);
      }
    });

    // 6. Build Neural Tractography Splines & Action Potential Particles Safely
    const tractGroup = new THREE.Group();
    tractGroup.name = 'neural_tracts_group';
    scene.add(tractGroup);

    interface TractRuntime {
      circuitId: string;
      curve: THREE.CatmullRomCurve3;
      tubeMesh: THREE.Mesh;
      particles: THREE.Points;
      particlePositions: Float32Array;
      particleProgress: number[];
      speed: number;
    }

    const tractRuntimes: TractRuntime[] = [];

    if (circuits && Array.isArray(circuits)) {
      circuits.forEach((circuit) => {
        if (!circuit || !circuit.splinePoints) return;
        const points = circuit.splinePoints.map((p) => new THREE.Vector3(...p));
        if (points.length < 2) return;

        const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');

        // Glowing tube tract
        const tubeGeom = new THREE.TubeGeometry(curve, 36, 0.024, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(circuit.color || '#06b6d4'),
          transparent: true,
          opacity: 0.55,
        });
        const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
        tractGroup.add(tubeMesh);

        // Firing action potential particle stream
        const count = 18;
        const particlePositions = new Float32Array(count * 3);
        const particleProgress: number[] = [];

        for (let i = 0; i < count; i++) {
          const prog = i / count;
          particleProgress.push(prog);
          const pt = curve.getPoint(prog);
          particlePositions[i * 3] = pt.x;
          particlePositions[i * 3 + 1] = pt.y;
          particlePositions[i * 3 + 2] = pt.z;
        }

        const pGeom = new THREE.BufferGeometry();
        pGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const pMat = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.08,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        });
        const particles = new THREE.Points(pGeom, pMat);
        tractGroup.add(particles);

        tractRuntimes.push({
          circuitId: circuit.id,
          curve,
          tubeMesh,
          particles,
          particlePositions,
          particleProgress,
          speed: 0.006,
        });
      });
    }

    // 7. Scalp 10-20 EEG Cap Safely
    const channelCoords = eegChannels && Array.isArray(eegChannels)
      ? eegChannels.map((c) => ({ name: c.name, coords3D: c.coords3D }))
      : [];
    const eegCapGroup = createEEG1020ElectrodeCap(channelCoords);
    if (eegCapGroup) {
      eegCapGroup.visible = false;
      scene.add(eegCapGroup);
    }

    // 8. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.8;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0, 0);

    // 9. Raycasting for anatomical inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(brainGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.regionId) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.regionId) {
          onSelectRegion(obj.userData.regionId as BrainRegionId);
        }
      } else {
        onSelectRegion(null);
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // 10. Animation Loop
    let animFrameId = 0;
    const clock = new THREE.Clock();

    function renderLoop() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Exploded View smooth exponential damping
      const curExplode = stateRef.current.exploded || 0;
      Object.entries(brainParts).forEach(([regId, partDef]) => {
        if (!partDef || !partDef.group) return;

        const targetPos = partDef.basePosition
          .clone()
          .add(partDef.explodedOffset.clone().multiplyScalar(curExplode));
        partDef.group.position.lerp(targetPos, 0.12);

        // Activation luminescence & X-ray transparency
        const rData = stateRef.current.regions ? stateRef.current.regions[regId as BrainRegionId] : undefined;
        const isHovered = stateRef.current.hoveredRegion === regId;
        const isSelected = stateRef.current.selectedRegionId === regId;

        const mat = partDef.material;
        if (mat) {
          if (stateRef.current.isXRayMode) {
            mat.transmission = 0.65;
            mat.opacity = 0.42;
            mat.roughness = 0.2;
          } else {
            mat.transmission = 0.0;
            mat.opacity = isSelected || isHovered ? 0.98 : 0.92;
            mat.roughness = 0.42;
          }

          // Emissive luminescence according to neural activation
          const activity = rData ? rData.activationLevel : 0.5;
          const pulse = Math.sin(elapsed * (3.0 + activity * 5.0)) * 0.15 + 0.85;

          if (isSelected || isHovered) {
            mat.emissive.copy(partDef.activeColor);
            mat.emissiveIntensity = 0.75 * pulse;
          } else if (activity > 0.65) {
            mat.emissive.copy(partDef.activeColor);
            mat.emissiveIntensity = (activity - 0.4) * 0.8 * pulse;
          } else {
            mat.emissive.setRGB(0, 0, 0);
            mat.emissiveIntensity = 0;
          }
        }
      });

      // Update Neural Tractography & Pulsing Action Potentials
      tractGroup.visible = !!stateRef.current.showTracts;
      if (eegCapGroup) {
        eegCapGroup.visible = !!stateRef.current.showEEGCap;
      }

      if (stateRef.current.showTracts) {
        tractRuntimes.forEach((tr) => {
          const circuitList = stateRef.current.circuits || [];
          const circuit = circuitList.find((c) => c.id === tr.circuitId);
          const act = circuit ? circuit.activityLevel : 0.5;
          const tubeMat = tr.tubeMesh.material as THREE.MeshBasicMaterial;
          if (tubeMat) {
            tubeMat.opacity = 0.35 + act * 0.55;
          }

          const speed = 0.005 + act * 0.025;
          const posAttr = tr.particles.geometry.attributes.position;

          for (let i = 0; i < tr.particleProgress.length; i++) {
            tr.particleProgress[i] = (tr.particleProgress[i] + speed) % 1.0;
            const pt = tr.curve.getPoint(tr.particleProgress[i]);
            posAttr.setXYZ(i, pt.x, pt.y, pt.z);
          }
          posAttr.needsUpdate = true;
        });
      }

      // Auto rotation
      if (stateRef.current.isAutoRotate) {
        brainGroup.rotation.y += delta * 0.25;
        tractGroup.rotation.y = brainGroup.rotation.y;
        if (eegCapGroup) {
          eegCapGroup.rotation.y = brainGroup.rotation.y;
        }
      }

      // Raycasting check for hover
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(brainGroup.children, true);
      if (hits.length > 0) {
        let topObj: THREE.Object3D | null = hits[0].object;
        while (topObj && !topObj.userData?.regionId) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.regionId) {
          setHoveredRegion(topObj.userData.regionId as BrainRegionId);
          if (container) container.style.cursor = 'pointer';
        } else {
          setHoveredRegion(null);
          if (container) container.style.cursor = 'grab';
        }
      } else {
        setHoveredRegion(null);
        if (container) container.style.cursor = 'grab';
      }

      controls.update();
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const selectedData = selectedRegionId && regions ? regions[selectedRegionId] : hoveredRegion && regions ? regions[hoveredRegion] : null;

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* OVERLAY LAYOUT */}
      <div className="absolute inset-x-3 top-3 bottom-[4.5rem] z-10 flex flex-col sm:flex-row sm:justify-between gap-2 overflow-y-auto sm:overflow-hidden overscroll-contain pointer-events-none">
        {/* LEFT COLUMN: spec badge, selected-region HUD, neural circuits */}
        <div className="flex flex-col gap-2 w-full sm:w-72 lg:w-80 xl:w-96 sm:shrink-0 sm:min-h-0 sm:overflow-y-auto overscroll-contain pointer-events-none">
          {/* Spec Badge */}
          <div className="shrink-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 bg-slate-900/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
              {language === 'bn' ? 'বায়োফিজিক্যাল থ্রিডি ব্রেইন মডেল' : 'BIOPHYSICAL 3D CORTEX & NUCLEI'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">r160+ PBR</span>
          </div>

          {/* Selected or Hovered Region Quick HUD */}
          {selectedData && (
            <div className="shrink-0 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-2xl pointer-events-auto">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white flex items-start gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 mt-1 rounded-full shrink-0"
                    style={{ backgroundColor: selectedData.colorHex }}
                  />
                  <span className="break-words min-w-0">
                    {language === 'bn' ? selectedData.nameBn : selectedData.nameEn}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedData.currentFiringHz ? selectedData.currentFiringHz.toFixed(1) : '0.0'} Hz
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 mb-2">
                {language === 'bn' ? selectedData.descriptionBn : selectedData.descriptionEn}
              </p>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {selectedData.dominantTransmitters && selectedData.dominantTransmitters.map((nt) => (
                  <span key={nt} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {nt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extra left cards */}
          {leftPanel && <div className="shrink-0 pointer-events-auto">{leftPanel}</div>}
        </div>

        {/* RIGHT COLUMN: quick action buttons + anatomy inspector */}
        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-72 lg:w-80 xl:w-96 sm:shrink-0 sm:min-h-0 sm:overflow-y-auto overscroll-contain pointer-events-none">
          {/* Quick Action Buttons */}
          <div className="shrink-0 flex flex-wrap items-center sm:justify-end gap-2 pointer-events-auto">
            <button
              onClick={() => setShowTracts(!showTracts)}
              title="Toggle Neural Fiber Tracts"
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showTracts
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'নিউরন ফাইবার' : 'Tracts'}</span>
            </button>

            <button
              onClick={() => setShowEEGCap(!showEEGCap)}
              title="Toggle 10-20 EEG Scalp Electrode Cap"
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showEEGCap
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'EEG ক্যাপ' : '10-20 Cap'}</span>
            </button>

            <button
              onClick={() => setIsXRayMode(!isXRayMode)}
              title="Toggle X-Ray / Glass Transparency"
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isXRayMode
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'এক্স-রে মোড' : 'X-Ray'}</span>
            </button>

            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Toggle Auto Rotation"
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isAutoRotate
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Extra right cards */}
          {rightPanel && <div className="shrink-0 w-full flex justify-start sm:justify-end pointer-events-auto">{rightPanel}</div>}
        </div>
      </div>

      {/* Bottom Floating Exploded View Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[calc(100%-1.5rem)] w-[92%] sm:w-auto">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'অঙ্গ ব্যবচ্ছেদ (Exploded View):' : 'Anatomy Separation:'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodedFactor}
          onChange={(e) => onExplodedChange(parseFloat(e.target.value))}
          className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
        />
        <span className="text-xs font-mono text-cyan-400 min-w-9">
          {Math.round(explodedFactor * 100)}%
        </span>
      </div>
    </div>
  );
};