/**
 * SynapseLab 3D - Virtual Neuroscience & Neural Circuit Laboratory
 * Interactive procedural 3D brain simulation with biophysical neural dynamics,
 * multi-channel EEG, fMRI BOLD, fNIRS, and realistic cognitive experiment modeling.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrainRegionId,
  BrainRegionData,
  NeurotransmitterType,
  NeurotransmitterState,
  NeuralCircuit,
  EEGChannelData,
  EEGBandPower,
  ExperimentScenario,
  DiagnosticToolType,
} from './types/neuroscience.ts';
import {
  INITIAL_BRAIN_REGIONS,
  INITIAL_NEUROTRANSMITTERS,
  NEURAL_CIRCUITS,
  INITIAL_EEG_CHANNELS,
  computeEEGSignal,
  computeFNIRS,
} from './simulation/biophysicsEngine.ts';
import { EXPERIMENT_PRESETS } from './simulation/experimentPresets.ts';
import { BrainViewport } from './components/BrainViewport.tsx';
import { EEGMonitor } from './components/EEGMonitor.tsx';
import { DiagnosticSuite } from './components/DiagnosticSuite.tsx';
import { ExperimentStudio } from './components/ExperimentStudio.tsx';
import { NeurotransmitterDashboard } from './components/NeurotransmitterDashboard.tsx';
import { AnatomyInspector } from './components/AnatomyInspector.tsx';

import {
  Brain,
  Activity,
  FlaskConical,
  Volume2,
  VolumeX,
  Languages,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function App() {
  // 1. Language state: Bengali ('bn') or English ('en')
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  // 2. Neuroscience Biophysical State
  const [regions, setRegions] = useState<Record<BrainRegionId, BrainRegionData>>(INITIAL_BRAIN_REGIONS);
  const [neurotransmitters, setNeurotransmitters] = useState<Record<NeurotransmitterType, NeurotransmitterState>>(INITIAL_NEUROTRANSMITTERS);
  const [circuits, setCircuits] = useState<NeuralCircuit[]>(NEURAL_CIRCUITS);
  const [eegChannels, setEegChannels] = useState<EEGChannelData[]>(INITIAL_EEG_CHANNELS);
  const [bandPower, setBandPower] = useState<EEGBandPower>({
    delta: 0.25,
    theta: 0.35,
    alpha: 0.50,
    beta: 0.45,
    gamma: 0.30,
  });
  const [fnirsData, setFnirsData] = useState({ deltaHbO: 0.85, deltaHbR: -0.32, toi: 68.5 });

  // 3. Experiment Scenario & Simulation Runner
  const [currentScenario, setCurrentScenario] = useState<ExperimentScenario>(EXPERIMENT_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationMinute, setSimulationMinute] = useState<number>(20);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  // 4. Viewport & Inspection State
  const [selectedRegionId, setSelectedRegionId] = useState<BrainRegionId | null>(null);
  const [activeCircuitId, setActiveCircuitId] = useState<string | null>('mesolimbic_reward');
  const [explodedFactor, setExplodedFactor] = useState<number>(0.0);
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState<DiagnosticToolType>('eeg');
  const [isBottomDockExpanded, setIsBottomDockExpanded] = useState<boolean>(true);

  // 5. Procedural Web Audio Sound Generator for EEG frequency hum
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Audio tone generation
  useEffect(() => {
    if (!isAudioMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      } catch (err) {
        console.warn('Web Audio error:', err);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
    }

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch (_) {}
      }
    };
  }, [isAudioMuted]);

  // Recalculate biophysical states based on current experiment scenario and simulation minute
  const updateBiophysicsFromSimulation = useCallback((minute: number, scenario: ExperimentScenario) => {
    const phases = scenario.phases;
    let curPhase = phases[0];
    for (let i = 0; i < phases.length; i++) {
      if (minute >= phases[i].minute) {
        curPhase = phases[i];
      }
    }

    setNeurotransmitters((prev) => {
      const updated = { ...prev };
      const mod = scenario.transmitterModifiers;

      const daConcentration = curPhase ? curPhase.dopamine : 50;
      updated.dopamine = {
        ...updated.dopamine,
        concentration: daConcentration,
      };

      const gluMod = mod.glutamate ?? 1.0;
      updated.glutamate = {
        ...updated.glutamate,
        concentration: Number((updated.glutamate.baseline * gluMod).toFixed(1)),
      };

      const gabaMod = mod.gaba ?? 1.0;
      updated.gaba = {
        ...updated.gaba,
        concentration: Number((updated.gaba.baseline * gabaMod).toFixed(1)),
      };

      const neMod = mod.norepinephrine ?? 1.0;
      updated.norepinephrine = {
        ...updated.norepinephrine,
        concentration: Number((updated.norepinephrine.baseline * neMod).toFixed(1)),
      };

      const seMod = mod.serotonin ?? 1.0;
      updated.serotonin = {
        ...updated.serotonin,
        concentration: Number((updated.serotonin.baseline * seMod).toFixed(1)),
      };

      const achMod = mod.acetylcholine ?? 1.0;
      updated.acetylcholine = {
        ...updated.acetylcholine,
        concentration: Number((updated.acetylcholine.baseline * achMod).toFixed(1)),
      };

      return updated;
    });

    setRegions((prev) => {
      const updated = { ...prev };
      const pfcAct = curPhase ? curPhase.pfcActivity : 0.5;
      const visAct = curPhase ? curPhase.visualActivity : 0.5;

      updated.pfc = {
        ...updated.pfc,
        activationLevel: pfcAct,
        currentFiringHz: updated.pfc.baselineFiringHz * (0.5 + pfcAct * 0.9),
      };

      updated.occipital_cortex = {
        ...updated.occipital_cortex,
        activationLevel: visAct,
        currentFiringHz: updated.occipital_cortex.baselineFiringHz * (0.6 + visAct * 1.2),
      };

      const vtaAct = (curPhase ? curPhase.dopamine : 50) / 80;
      updated.vta_striatum = {
        ...updated.vta_striatum,
        activationLevel: vtaAct,
        currentFiringHz: updated.vta_striatum.baselineFiringHz * (0.5 + vtaAct),
      };

      const cerebWeight = scenario.circuitWeights.cerebellar_loop ?? 0.5;
      updated.cerebellum = {
        ...updated.cerebellum,
        activationLevel: cerebWeight,
        currentFiringHz: updated.cerebellum.baselineFiringHz * (0.7 + cerebWeight * 0.8),
      };

      return updated;
    });

    setCircuits((prev) =>
      prev.map((c) => {
        const customWeight = scenario.circuitWeights[c.id];
        return {
          ...c,
          activityLevel: customWeight !== undefined ? customWeight : c.activityLevel,
        };
      })
    );

    if (scenario.eegBias) {
      setBandPower((prev) => ({
        ...prev,
        ...scenario.eegBias,
      }));
    }

    const fnirs = computeFNIRS(curPhase?.pfcActivity ?? 0.5, minute * 60);
    setFnirsData(fnirs);

    if (oscRef.current && audioCtxRef.current) {
      const targetFreq = 160 + (curPhase?.pfcActivity ?? 0.5) * 140;
      oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
    }
  }, []);

  useEffect(() => {
    let timerId = 0;
    const intervalMs = 50;

    const tick = () => {
      const now = performance.now();

      setEegChannels((prevChannels) =>
        prevChannels.map((ch) => {
          const regData = regions[ch.region];
          const regActivity = regData ? regData.activationLevel : 0.5;
          const newVolt = computeEEGSignal(ch, now, bandPower, regActivity);

          const newHistory = [...ch.history.slice(1), newVolt];
          return {
            ...ch,
            currentMicrovolts: newVolt,
            history: newHistory,
          };
        })
      );

      timerId = window.setTimeout(tick, intervalMs);
    };

    tick();

    return () => {
      clearTimeout(timerId);
    };
  }, [regions, bandPower]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationMinute((prev) => {
        const nextMin = (prev + 1) % (currentScenario.durationMinutes + 1);
        updateBiophysicsFromSimulation(nextMin, currentScenario);
        return nextMin;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, currentScenario, updateBiophysicsFromSimulation]);

  const handleSelectScenario = (sc: ExperimentScenario) => {
    setCurrentScenario(sc);
    setSimulationMinute(0);
    updateBiophysicsFromSimulation(0, sc);
    setIsStudioOpen(false);
  };

  const handleApplyCustomParameters = (
    cWeights: Record<string, number>,
    tDials: Record<NeurotransmitterType, number>,
    duration: number
  ) => {
    const customSc: ExperimentScenario = {
      ...currentScenario,
      id: 'custom_experiment',
      titleEn: 'Custom User Neural Circuit Experiment',
      titleBn: 'কাস্টম ব্যবহারকারী নিউরাল সার্কিট পরীক্ষা',
      durationMinutes: duration,
      circuitWeights: cWeights,
      transmitterModifiers: tDials,
      phases: [
        {
          minute: 0,
          titleEn: 'Custom Protocol Initial',
          titleBn: 'কাস্টম প্রটোকল শুরু',
          summaryEn: 'Active user configured parameters applied.',
          summaryBn: 'ব্যবহারকারীর নির্ধারিত সার্কিট সক্রিয়।',
          dopamine: Math.round(50 * (tDials.dopamine ?? 1)),
          pfcActivity: cWeights.central_executive ?? 0.5,
          visualActivity: cWeights.visual_pathway ?? 0.6,
          fatigueLevel: 0.2,
        },
      ],
    };

    setCurrentScenario(customSc);
    updateBiophysicsFromSimulation(simulationMinute, customSc);
    setIsStudioOpen(false);
  };

  const selectedRegion = selectedRegionId ? regions[selectedRegionId] : null;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-y-auto">
      {/* 1. TOP STICKY LABORATORY NAVIGATION HEADER */}
      <header className="sticky top-0 h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">Virtual NeuroLab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                NEURO-BIOPHYSICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'bn'
                ? 'ভার্চুয়াল নিউরোসায়েন্স ল্যাবরেটরি ও নিউরাল সার্কিট সিমুলেশন'
                : 'Virtual Computational Neuroscience & Neural Circuit Laboratory'}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono">
              {language === 'bn' ? 'বর্তমান পরীক্ষা:' : 'ACTIVE EXPERIMENT:'}
            </span>
            <span className="text-xs font-semibold text-white max-w-[280px] truncate">
              {language === 'bn' ? currentScenario.titleBn : currentScenario.titleEn}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-800 font-mono text-xs">
            <span className="text-purple-400">{simulationMinute}m</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{currentScenario.durationMinutes}m</span>
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1 rounded-md transition-colors ${
              isSimulating ? 'text-amber-400 hover:bg-slate-800' : 'text-emerald-400 hover:bg-slate-800'
            }`}
            title={isSimulating ? 'Pause' : 'Resume'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudioOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এক্সপেরিমেন্ট স্টুডিও' : 'Experiment Studio'}</span>
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title="Toggle EEG Oscilloscope Sound"
            className={`p-2 rounded-xl border text-xs transition-colors ${
              !isAudioMuted
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <main className="max-w-[1700px] mx-auto px-4 py-6 space-y-8">
        {/* SECTION 1: 3D BRAIN VIEWPORT & CIRCUIT SELECTION */}
        <section className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative">
          <div className="h-[680px] w-full relative rounded-xl overflow-hidden border border-slate-800">
            <BrainViewport
              regions={regions}
              circuits={circuits}
              eegChannels={eegChannels}
              selectedRegionId={selectedRegionId}
              onSelectRegion={(id) => setSelectedRegionId(id)}
              language={language}
              explodedFactor={explodedFactor}
              onExplodedChange={(val) => setExplodedFactor(val)}
              leftPanel={
                <div className="flex flex-col gap-1.5 w-full bg-slate-900/85 border border-slate-800 p-2.5 rounded-xl backdrop-blur-sm shadow-xl">
                  <span className="text-[10px] font-mono text-cyan-300 tracking-wider">
                    {language === 'bn' ? 'সক্রিয় নিউরাল সার্কিটসমূহ (Neural Circuits):' : 'ACTIVE NEURAL CIRCUITS:'}
                  </span>
                  <div className="flex flex-col gap-1 max-h-44 overflow-y-auto overscroll-contain pr-1">
                    {circuits.map((circ) => {
                      const isActive = circ.activityLevel > 0.4;
                      const circName = language === 'bn' ? circ.nameBn : circ.nameEn;
                      return (
                        <div
                          key={circ.id}
                          title={circName}
                          onClick={() => setActiveCircuitId(circ.id)}
                          className={`px-2 py-1 rounded text-[11px] cursor-pointer flex items-center justify-between gap-2 border transition-colors ${
                            activeCircuitId === circ.id
                              ? 'bg-slate-800 border-cyan-500/60 text-white font-medium'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: circ.color,
                                boxShadow: isActive ? `0 0 6px ${circ.color}` : 'none',
                              }}
                            />
                            <span className="truncate">{circName}</span>
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 shrink-0">
                            {Math.round(circ.activityLevel * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
              rightPanel={
                selectedRegion ? (
                  <AnatomyInspector
                    region={selectedRegion}
                    activeCircuit={null}
                    onClose={() => setSelectedRegionId(null)}
                    language={language}
                  />
                ) : null
              }
            />
          </div>
        </section>

        {/* SECTION 2: BIOCHEMICAL NEUROTRANSMITTER STATE */}
        <section className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {language === 'bn' ? 'বায়োকেমিক্যাল নিউরোট্রান্সমিটার অবস্থা' : 'Biochemical Neurotransmitter State'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'রিয়েল-টাইম সাইন্যাপটিক ঘনমাত্রা এবং রিসেপ্টর ক্রিয়াশীলতার বিশ্লেষণ'
                  : 'Real-time synaptic neurotransmitter concentrations and receptor activity dynamics.'}
              </p>
            </div>
          </div>
          <NeurotransmitterDashboard
            neurotransmitters={neurotransmitters}
            language={language}
          />
        </section>

        {/* SECTION 3: EEG & DIAGNOSTICS SUITE */}
        <section className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">
                {language === 'bn' ? 'ইইজি ও ক্লিনিক্যাল ডায়াগনস্টিক সিগন্যাল' : 'EEG & Clinical Diagnostic Signals'}
              </h2>
            </div>
            <button
              onClick={() => setIsBottomDockExpanded(!isBottomDockExpanded)}
              className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {isBottomDockExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'bn' ? 'সংকুচিত করুন' : 'Collapse View'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'bn' ? 'প্রসারিত করুন' : 'Expand View'}</span>
                </>
              )}
            </button>
          </div>

          {isBottomDockExpanded && (
            <div className="grid grid-cols-1 gap-6">
              {activeDiagnosticTab === 'eeg' && (
                <EEGMonitor
                  channels={eegChannels}
                  bandPower={bandPower}
                  activeExperimentTitle={language === 'bn' ? currentScenario.titleBn : currentScenario.titleEn}
                  language={language}
                />
              )}

              <DiagnosticSuite
                activeTab={activeDiagnosticTab}
                onTabChange={(tab) => setActiveDiagnosticTab(tab)}
                regions={regions}
                neurotransmitters={neurotransmitters}
                fnirsData={fnirsData}
                language={language}
              />
            </div>
          )}
        </section>
      </main>

      {/* 3. MODAL: EXPERIMENT STUDIO DRAWER */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <ExperimentStudio
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            onApplyCustomParameters={handleApplyCustomParameters}
            circuits={circuits}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            simulationMinute={simulationMinute}
            onSeekMinute={(min) => {
              setSimulationMinute(min);
              updateBiophysicsFromSimulation(min, currentScenario);
            }}
            language={language}
            onClose={() => setIsStudioOpen(false)}
          />
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 mt-16 py-8 text-center text-xs text-slate-500">
        SynapseLab 3D • Computational Neuro-Biophysics Platform
      </footer>
    </div>
  );
}