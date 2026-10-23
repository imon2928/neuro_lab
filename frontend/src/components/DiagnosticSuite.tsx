/**
 * SynapseLab 3D - Multi-Modal Non-Invasive Brain Diagnostic Suite
 * Features fMRI (BOLD Hemodynamic), MEG (SQUID femtotesla), fNIRS (HbO/HbR optodes),
 * and Cerebellar Synaptic Vesicle Molecular Biophysics (based on user uploaded document).
 */

import React, { useState } from 'react';
import {
  DiagnosticToolType,
  BrainRegionData,
  NeurotransmitterState,
  BrainRegionId,
  SynapticVesicleProtein,
} from '../types/neuroscience.ts';
import { SYNAPTIC_VESICLE_PROTEINS_LIST } from '../simulation/biophysicsEngine.ts';
import {
  Activity,
  Scan,
  Compass,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  Atom,
  Flame,
} from 'lucide-react';

interface DiagnosticSuiteProps {
  activeTab: DiagnosticToolType;
  onTabChange: (tab: DiagnosticToolType) => void;
  regions: Record<BrainRegionId, BrainRegionData>;
  neurotransmitters: Record<string, NeurotransmitterState>;
  fnirsData: { deltaHbO: number; deltaHbR: number; toi: number };
  language: 'en' | 'bn';
}

export const DiagnosticSuite: React.FC<DiagnosticSuiteProps> = ({
  activeTab,
  onTabChange,
  regions,
  neurotransmitters,
  fnirsData,
  language,
}) => {
  const [selectedSlice, setSelectedSlice] = useState<'axial' | 'coronal' | 'sagittal'>('axial');

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            {language === 'bn' ? 'নন-ইনভেসিভ নিউরো-ডায়াগনস্টিক স্যুট' : 'Non-Invasive Neuro-Diagnostic Suite'}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('eeg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'eeg'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>EEG (10-20)</span>
          </button>

          <button
            onClick={() => onTabChange('fmri')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'fmri'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>fMRI BOLD</span>
          </button>

          <button
            onClick={() => onTabChange('fnirs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'fnirs'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>fNIRS Optical</span>
          </button>

          <button
            onClick={() => onTabChange('meg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'meg'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>MEG (fT)</span>
          </button>

          <button
            onClick={() => onTabChange('synapse_vesicle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'synapse_vesicle'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাইন্যাপটিক ভেসিকল (PDF)' : 'Synapse Vesicles (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: fMRI BOLD (Hemodynamic Functional Imaging) */}
      {activeTab === 'fmri' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Slice MRI View */}
          <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300">
                {language === 'bn'
                  ? `fMRI BOLD মেটাবলিক অ্যাক্টিভেশন স্লাইস (${selectedSlice.toUpperCase()})`
                  : `fMRI BOLD Hemodynamic Slices (${selectedSlice.toUpperCase()})`}
              </span>
              <div className="flex gap-1 text-[11px] font-mono">
                {(['axial', 'coronal', 'sagittal'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlice(s)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      selectedSlice === s
                        ? 'bg-cyan-900 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Medical Cross-Section Slice */}
            <div className="relative h-60 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Anatomical MRI Silhouette */}
              <div className="relative w-48 h-48 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center">
                {/* Ventricles center cavity */}
                <div className="w-12 h-16 rounded-full border border-slate-800 bg-slate-950" />

                {/* Regional BOLD metabolic heatmaps */}
                {Object.entries(regions).map(([id, reg]) => {
                  if (reg.activationLevel < 0.45) return null;
                  const left =
                    id === 'pfc'
                      ? '50%'
                      : id === 'occipital_cortex'
                      ? '50%'
                      : id === 'temporal_cortex'
                      ? '20%'
                      : id === 'cerebellum'
                      ? '50%'
                      : '65%';
                  const top =
                    id === 'pfc'
                      ? '20%'
                      : id === 'occipital_cortex'
                      ? '80%'
                      : id === 'temporal_cortex'
                      ? '50%'
                      : id === 'cerebellum'
                      ? '85%'
                      : '45%';
                  const size = Math.round(reg.activationLevel * 38);
                  return (
                    <div
                      key={id}
                      className="absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                      style={{
                        left,
                        top,
                        width: `${size}px`,
                        height: `${size}px`,
                        background: `radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(245, 158, 11, 0.6) 50%, transparent 100%)`,
                        filter: 'blur(3px)',
                      }}
                    />
                  );
                })}

                <span className="absolute bottom-2 text-[9px] font-mono text-slate-400">
                  TR = 2000ms | TE = 30ms | 3.0 Tesla
                </span>
              </div>

              {/* Color Bar */}
              <div className="absolute right-3 top-3 bottom-3 w-3 bg-gradient-to-t from-blue-900 via-amber-500 to-rose-600 rounded-sm flex flex-col justify-between text-[8px] font-mono text-white px-0.5">
                <span>+6.5</span>
                <span>Z-score</span>
                <span>0.0</span>
              </div>
            </div>
          </div>

          {/* Regional Activation Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {language === 'bn' ? 'অঞ্চলভিত্তিক BOLD সংকেত (ROI)' : 'Region of Interest (ROI) Stats'}
            </span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-56 pr-1">
              {Object.values(regions).map((r) => {
                const zScore = (r.activationLevel * 6.8).toFixed(1);
                return (
                  <div
                    key={r.id}
                    className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200 text-[11px]">
                        {language === 'bn' ? r.nameBn : r.nameEn}
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize">{r.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-300 font-bold">Z = {zScore}</span>
                      <span className="text-[9px] block text-slate-400">p &lt; 0.001</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: fNIRS (Optical Spectroscopy) */}
      {activeTab === 'fnirs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-300">
                {language === 'bn'
                  ? 'ফ্রন্টাল কর্টেক্স fNIRS হেমোগ্লোবিন স্পেকট্রোস্কোপি'
                  : 'Frontal Cortex fNIRS Near-Infrared Optical Density'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">λ1=760nm | λ2=850nm</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-rose-950/60 flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">Δ[HbO] Oxy-Hemoglobin</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {fnirsData.deltaHbO > 0 ? '+' : ''}{fnirsData.deltaHbO} μmol/L
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {language === 'bn' ? 'অক্সিজেন সমৃদ্ধ রক্ত সরবরাহ' : 'Arterial oxygen delivery'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-blue-950/60 flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">Δ[HbR] Deoxy-Hemoglobin</span>
                <span className="text-xl font-bold font-mono text-blue-400">
                  {fnirsData.deltaHbR > 0 ? '+' : ''}{fnirsData.deltaHbR} μmol/L
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {language === 'bn' ? 'অক্সিজেনহীন রক্তের অনুপাত' : 'Venous metabolic extraction'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-950/60 flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">TOI Tissue Oxygenation</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {fnirsData.toi}%
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {language === 'bn' ? 'টিস্যু পারফিউশন সক্ষমতা' : 'Normal cerebral reserve (60-80%)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              {language === 'bn'
                ? 'মডিফাইড বিয়ার-ল্যাম্বার্ট ল (Modified Beer-Lambert Law) অনুযায়ী ফ্রন্টাল অপটোড দিয়ে মাপা হচ্ছে। রিলস স্ক্রলিংয়ের সময় প্রাথমিক পর্যায়ে পিএফসি পারফিউশন স্বাভাবিক থাকলেও দীর্ঘ সময় পর হাইপোফ্রন্টালিটির কারণে অক্সিজেন ব্যবহার কমে যায়।'
                : 'Measures cerebral tissue oxygen saturation via modified Beer-Lambert Law. Prolonged hyper-stimulation leads to frontal metabolic exhaustion (hypofrontality).'}
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-200">
              {language === 'bn' ? 'অপটিক্যাল চ্যানেল স্ট্যাটাস' : 'Optode Pairs Status'}
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Optode S1-D1 (Left PFC)</span>
                <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Optode S2-D2 (Right PFC)</span>
                <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Optode S3-D3 (Broca Area)</span>
                <span className="text-emerald-400 font-mono font-bold">STANDBY</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-900">
              Continuous NIR Photodiode Sampling: 50 Hz
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEG (Magnetoencephalography) */}
      {activeTab === 'meg' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
            <span className="text-xs font-mono text-cyan-300">
              {language === 'bn'
                ? 'MEG SQUID ম্যাগনেটোমিটার সেন্সর ফিল্ড (ফেমটোট্যাসলা - fT)'
                : 'MEG SQUID Sensor Array (Femtotesla - fT)'}
            </span>
            <p className="text-xs text-slate-300">
              {language === 'bn'
                ? 'মস্তিষ্কের অ্যাক্সনের পোস্ট-সাইন্যাপটিক কারেন্ট থেকে তৈরি অতিসূক্ষ্ম চৌম্বক ক্ষেত্র পরিমাপ করে (১০০-৫০০ fT), যা স্ক্যাল্পের হাড় বা চামড়া দ্বারা বাধাগ্রস্ত হয় না।'
                : 'Measures sub-picotesla tangential magnetic fields generated by intracellular dendritic currents without scalp smearing.'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Occipital Visual M100 Peak</span>
                <span className="text-lg font-mono font-bold text-cyan-400 block">340 fT</span>
                <span className="text-[10px] text-slate-500">Latency: 98 ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Frontal N200 Novelty Dipole</span>
                <span className="text-lg font-mono font-bold text-purple-400 block">210 fT</span>
                <span className="text-[10px] text-slate-500">Latency: 185 ms</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-200">
              {language === 'bn' ? 'চৌম্বকীয় উৎস স্থানীয়করণ' : 'Magnetic Source Localization'}
            </span>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>Dipole Position:</span>
                <span className="font-mono text-cyan-300">X: 12.4, Y: -68.1, Z: 8.2 mm</span>
              </div>
              <div className="flex justify-between">
                <span>Goodness of Fit (GOF):</span>
                <span className="font-mono text-emerald-400 font-bold">94.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Dominant Current:</span>
                <span className="font-mono text-amber-300">Occipital Calcarine Gyri</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Superconducting Quantum Interference Device (SQUID) Active
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Synaptic Vesicle Molecular Electron Microscopy (USER UPLOADED PDF) */}
      {activeTab === 'synapse_vesicle' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Atom className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">
                  {language === 'bn'
                    ? 'সেরিবিলার ও কর্টিকাল সাইন্যাপটিক ভেসিকল প্রোটিন মেকানিজম (আপলোডকৃত ডকুমেন্ট)'
                    : 'Cerebellar Synaptic Vesicle Cascade (From Uploaded Medical Spec)'}
                </h4>
                <p className="text-[11px] text-emerald-200/70">
                  {language === 'bn'
                    ? 'মসি ফাইবার, পার্কিঞ্জি সেল ও নিউরোট্রান্সমিটার ভেসিকল ফিউশনের প্রতিটি প্রোটিনের সরাসরি বায়োফিজিক্যাল ভূমিকা'
                    : 'Real biophysical simulation of SNARE complex, VGLUT2, V-ATPase, Synaptotagmin-1 Ca²⁺ sensor and Munc13-3'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
              PDF VERIFIED
            </span>
          </div>

          {/* 4-Step Molecular Flow Chart matching Page 9 of PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-cyan-400 block font-bold">1. LOADING</span>
              <p className="text-[11px] text-slate-200 mt-1">
                {language === 'bn' ? 'V-ATPase ও VGLUT গ্লুটামেট লোড করে' : 'V-ATPase & VGLUT pump glutamate'}
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 block font-bold">2. PREPARATION</span>
              <p className="text-[11px] text-slate-200 mt-1">
                {language === 'bn' ? 'Rab3A ও Munc13 ভেসিকল নোঙর করে' : 'Rab3A & Munc13-3 dock & prime'}
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-rose-400 block font-bold">3. Ca²⁺ TRIGGER</span>
              <p className="text-[11px] text-slate-200 mt-1">
                {language === 'bn' ? 'Synaptotagmin ক্যালসিয়াম গ্রহণ করে' : 'Synaptotagmin binds Ca²⁺'}
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 block font-bold">4. FUSION</span>
              <p className="text-[11px] text-slate-200 mt-1">
                {language === 'bn' ? 'SNARE ফিউশন ও ট্রান্সমিটার নিঃসরণ' : 'SNARE pin drives exocytosis'}
              </p>
            </div>
          </div>

          {/* Detailed Protein Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {SYNAPTIC_VESICLE_PROTEINS_LIST.map((prot) => (
              <div
                key={prot.name}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-white">{prot.name}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        prot.status === 'fusing'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : prot.status === 'primed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {prot.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 block mb-1">{prot.type}</span>
                  <p className="text-[11px] text-slate-300 line-clamp-3">
                    {language === 'bn' ? prot.functionBn : prot.functionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EEG Quick Summary Overview (Default) */}
      {activeTab === 'eeg' && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {language === 'bn' ? 'ইইজি ক্লিনিক্যাল বিশ্লেষণ ও ডায়াগনোসিস' : 'EEG Diagnostic Impression'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">10-20 Standard Electrode Montage</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'মস্তিষ্কের বৈদ্যুতিক তরঙ্গ প্রতিটি কর্টিকাল অঞ্চলের পোস্ট-সাইন্যাপটিক সম্ভাব্যতা থেকে সরাসরি রিয়েল-টাইমে পরিমাপ করা হচ্ছে। ফ্রন্টাল ইলেক্ট্রোড (Fp1, Fp2, F3, F4) নির্বাহী কার্য পর্যবেক্ষণ করছে এবং অক্সিপিটাল ইলেক্ট্রোড (O1, O2) ভিজ্যুয়াল কর্টেক্সের দ্রুত ফ্রেম পরিবর্তন বিশ্লেষণ করছে।'
              : 'Continuous recording of post-synaptic pyramidal dipoles across standard 10-20 scalp locations. Frontal channels track cognitive executive control while occipital channels monitor high-frequency sensory photic stimulation.'}
          </p>
        </div>
      )}
    </div>
  );
};
