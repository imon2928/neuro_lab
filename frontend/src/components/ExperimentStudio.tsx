/**
 * SynapseLab 3D - Experiment Studio & Environmental Parameter Control
 * Configures virtual laboratory experiments (such as prolonged Reels scrolling),
 * toggles active neural circuits, modulates neurotransmitters, and guides data collection methodology.
 */

import React, { useState } from 'react';
import { ExperimentScenario, NeuralCircuit, NeurotransmitterType } from '../types/neuroscience.ts';
import { EXPERIMENT_PRESETS } from '../simulation/experimentPresets.ts';
import {
  Play,
  RotateCcw,
  Sliders,
  FlaskConical,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  X,
  Gauge,
  ChevronRight,
} from 'lucide-react';

interface ExperimentStudioProps {
  currentScenario: ExperimentScenario;
  onSelectScenario: (scenario: ExperimentScenario) => void;
  onApplyCustomParameters: (
    circuits: Record<string, number>,
    transmitters: Record<NeurotransmitterType, number>,
    duration: number
  ) => void;
  circuits: NeuralCircuit[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationMinute: number;
  onSeekMinute: (min: number) => void;
  language: 'en' | 'bn';
  onClose?: () => void;
}

export const ExperimentStudio: React.FC<ExperimentStudioProps> = ({
  currentScenario,
  onSelectScenario,
  onApplyCustomParameters,
  circuits,
  isSimulating,
  onToggleSimulation,
  simulationMinute,
  onSeekMinute,
  language,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'methodology'>('presets');

  // Custom configuration state
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [circuitWeights, setCircuitWeights] = useState<Record<string, number>>({
    mesolimbic_reward: 0.8,
    visual_pathway: 0.85,
    cerebellar_loop: 0.4,
    central_executive: 0.3,
    dmn_default: 0.3,
    stress_arousal: 0.5,
  });
  const [transmitterDials, setTransmitterDials] = useState<Record<NeurotransmitterType, number>>({
    dopamine: 1.4,
    glutamate: 1.2,
    gaba: 0.8,
    norepinephrine: 1.1,
    serotonin: 0.8,
    acetylcholine: 0.6,
  });

  const handleApplyCustom = () => {
    onApplyCustomParameters(circuitWeights, transmitterDials, customDuration);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 max-w-4xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'bn' ? 'এক্সপেরিমেন্ট স্টুডিও ও ল্যাব কন্ট্রোল' : 'Neuroscience Experiment Studio'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700">
                LAB VIRTUAL PROTOCOL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'রিলস স্ক্রলিং বা বিশেষ পরিবেশ অনুযায়ী মস্তিষ্কের নিউরাল সার্কিট ও কেমিক্যাল নির্ধারণ'
                : 'Configure active neural circuits, neurotransmitter floods, and behavioral scenarios.'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'presets'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'স্ট্যান্ডার্ড এক্সপেরিমেন্ট প্রিসেট' : 'Standard Presets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'custom'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কাস্টম সার্কিট ও পরিবেশ বিল্ডার' : 'Custom Circuit Tuner'}</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'methodology'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'বাস্তব ডেটা সংগ্রহ গাইডলাইন' : 'Data Collection Methodology'}</span>
        </button>
      </div>

      {/* TAB 1: PRESETS */}
      {activeTab === 'presets' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPERIMENT_PRESETS.map((sc) => {
              const isSelected = currentScenario.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        {language === 'bn' ? sc.titleBn : sc.titleEn}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {sc.durationMinutes} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                      {language === 'bn' ? sc.descriptionBn : sc.descriptionEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-purple-300 font-mono">
                      {Object.keys(sc.circuitWeights).length} Circuits Active
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      {isSelected ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                      ) : (
                        <span>{language === 'bn' ? 'লোড করুন' : 'Load'}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Experiment Details & Timeline */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {language === 'bn' ? 'সিমুলেশন টাইমলাইন ও পর্যায়সমূহ' : 'Simulation Phases Timeline'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? `${currentScenario.titleBn} এর বর্তমান সময়: ${simulationMinute} মিনিট / ${currentScenario.durationMinutes} মিনিট`
                    : `Current: Minute ${simulationMinute} of ${currentScenario.durationMinutes}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSimulation}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isSimulating
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulating ? (language === 'bn' ? 'থামান' : 'Pause') : (language === 'bn' ? 'শুরু করুন' : 'Run')}</span>
                </button>
                <button
                  onClick={() => onSeekMinute(0)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Reset to Minute 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timeline Slider */}
            <input
              type="range"
              min="0"
              max={currentScenario.durationMinutes}
              value={simulationMinute}
              onChange={(e) => onSeekMinute(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />

            {/* Phases Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              {currentScenario.phases.map((ph, idx) => {
                const isActive = simulationMinute >= ph.minute;
                return (
                  <div
                    key={idx}
                    onClick={() => onSeekMinute(ph.minute)}
                    className={`p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                      isActive
                        ? 'bg-purple-950/60 border-purple-600 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-cyan-400 block">
                      T = {ph.minute}m
                    </span>
                    <span className="font-bold text-[11px] block truncate">
                      {language === 'bn' ? ph.titleBn : ph.titleEn}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {language === 'bn' ? ph.summaryBn : ph.summaryEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM CIRCUIT & TRANSMITTER TUNER */}
      {activeTab === 'custom' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-white block mb-1">
              {language === 'bn'
                ? 'কাস্টম পরীক্ষা: মস্তিষ্কে কোন কোন নিউরাল সার্কিট সক্রিয় থাকবে নির্ধারণ করুন'
                : 'Custom Protocol: Set Active Neural Circuits & Firing Weights'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'প্রতিটি সার্কিটের তীব্রতা বাড়িয়ে বা কমিয়ে থ্রিডি ব্রেইনে তার সরাসরি প্রভাব পর্যবেক্ষণ করুন।'
                : 'Modulate circuit weights to observe firing pathways and neurotransmitter cascades.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Circuits Weights */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-cyan-300">
                {language === 'bn' ? 'নিউরাল সার্কিট তীব্রতা (Activity Level)' : 'Neural Circuit Activation'}
              </span>
              {circuits.map((circ) => {
                const weight = circuitWeights[circ.id] ?? 0.5;
                return (
                  <div key={circ.id} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">
                        {language === 'bn' ? circ.nameBn : circ.nameEn}
                      </span>
                      <span className="font-mono text-cyan-400">{Math.round(weight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={weight}
                      onChange={(e) =>
                        setCircuitWeights({
                          ...circuitWeights,
                          [circ.id]: parseFloat(e.target.value),
                        })
                      }
                      className="accent-cyan-400 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {/* Neurotransmitter Modifiers */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-purple-300">
                {language === 'bn' ? 'কেমিক্যাল ও নিউরোট্রান্সমিটার মাত্রা' : 'Neurotransmitter Multipliers'}
              </span>
              {(['dopamine', 'glutamate', 'gaba', 'norepinephrine', 'serotonin', 'acetylcholine'] as NeurotransmitterType[]).map(
                (nt) => {
                  const val = transmitterDials[nt] ?? 1.0;
                  return (
                    <div key={nt} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300 capitalize font-medium">{nt}</span>
                        <span className="font-mono text-purple-400">{val.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        value={val}
                        onChange={(e) =>
                          setTransmitterDials({
                            ...transmitterDials,
                            [nt]: parseFloat(e.target.value),
                          })
                        }
                        className="accent-purple-400 cursor-pointer"
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <button
            onClick={handleApplyCustom}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'ব্রেইনে এই প্যারামিটার প্রয়োগ করুন' : 'Apply Custom Parameters to 3D Brain'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: DATA COLLECTION METHODOLOGY (Directly answers user's inquiry!) */}
      {activeTab === 'methodology' && (
        <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
          <div className="bg-cyan-950/40 border border-cyan-800/60 p-3.5 rounded-xl">
            <h4 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              {language === 'bn'
                ? 'বাস্তবে একজন মানুষ রিলস দেখলে কীভাবে ডেটা সংগ্রহ করা হয়? (বৈজ্ঞানিক পদ্ধতি)'
                : 'How Real Data Is Collected From Human Subjects Watching Reels'}
            </h4>
            <p className="text-slate-300">
              {language === 'bn'
                ? 'ব্যবহারকারী প্রশ্ন করেছেন: "আমি যদি একজন মানুষকে এক ঘন্টা reels দেখতে দেই তাহলে তার কোন neural circuit গুলো active থাকবে আমি সেটা identify করব এবং data কিভাবে নেওয়া যায় সেটার একটা আইডিয়া দিতে..." নিচে বাস্তব গবেষণাগারের মানসম্মত পদ্ধতি তুলে ধরা হলো:'
                : 'Standard neuroscience laboratory protocol for measuring neural adaptations during mobile video scrolling.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">
                {language === 'bn' ? '১. হাই-ডেনসিটি EEG ক্যাপ (10-20 সিস্টেম)' : '1. High-Density Scalp EEG'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {language === 'bn'
                  ? 'সাবজেক্টের মাথায় ১৬ থেকে ৬৪ চ্যানেলের ওয়্যারলেস ইইজি ক্যাপ পরিয়ে রিলস দেখার সময় প্রতি সেকেন্ডের ব্রেইন ওয়েভ রেকর্ড করা হয়। ফ্রন্টাল আলফা অ্যাসিমেট্রি এবং অক্সিপিটাল বিটা/গামা তরঙ্গ পরিমাপ করা হয়।'
                  : 'Measures continuous microvolt ERPs and power spectral shifts (frontal theta/beta ratio) during swipe events.'}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">
                {language === 'bn' ? '২. আই-ট্র্যাকিং ও পিউপিলোমেট্রি (Eye-Tracking)' : '2. Eye-Tracking & Pupillometry'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {language === 'bn'
                  ? 'ইনফ্রারেড আই-ট্র্যাকার দিয়ে প্রতি সেকেন্ডের স্যাক্যাডিক আই মুভমেন্ট এবং চোখের মনির প্রসারণ মাপা হয়। পিউপিলের প্রসারণ লোকাস সোরিউলিয়াস থেকে নরএপিনেফ্রিন নিঃসরণ নির্দেশ করে।'
                  : 'Tracks rapid eye saccades, fixations, and pupil dilation as a direct proxy of noradrenergic arousal.'}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">
                {language === 'bn' ? '৩. ওয়্যারলেস fNIRS অপটোড ব্যান্ড' : '3. Wireless Prefrontal fNIRS'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {language === 'bn'
                  ? 'মাথার কপালে বসানো অপটিক্যাল সেন্সর দিয়ে প্রিফ্রন্টাল কর্টেক্সে রক্তের অক্সিজেন শোষণ (HbO) মাপা হয়। দীর্ঘক্ষণ স্ক্রলিংয়ের পর প্রিফ্রন্টাল রক্তপ্রবাহ কমে গেলে ক্লান্তি (hypofrontality) প্রমাণিত হয়।'
                  : 'Measures oxygenated hemoglobin drop in dlPFC, quantifying cognitive fatigue and executive depletion.'}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">
                {language === 'bn' ? '৪. স্ক্রিন ইন্টারঅ্যাকশন টাইমস্ট্যাম্প লগিং' : '4. Behavioral Telemetry'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {language === 'bn'
                  ? 'প্রতিটি সোয়াইপের সময়কাল, কনটেন্ট পরিবর্তনের গতি এবং ওয়াচ-টাইম মিলি-সেকেন্ড নিখুঁতভাবে নিউরাল ডেটার সাথে সিঙ্ক করা হয়।'
                  : 'Correlates swipe gestures with millisecond EEG spikes to calculate reward prediction error.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
