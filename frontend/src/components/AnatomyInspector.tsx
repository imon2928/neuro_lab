/**
 * SynapseLab 3D - Anatomical Region & Neural Circuit Detailed Inspector
 * Displays cellular histology, primary transmitters, and biophysical mechanics.
 */

import React from 'react';
import { BrainRegionData, NeuralCircuit, BrainRegionId } from '../types/neuroscience.ts';
import {
  Brain,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

interface AnatomyInspectorProps {
  region: BrainRegionData | null;
  activeCircuit: NeuralCircuit | null;
  onClose: () => void;
  language: 'en' | 'bn';
}

export const AnatomyInspector: React.FC<AnatomyInspectorProps> = ({
  region,
  activeCircuit,
  onClose,
  language,
}) => {
  if (!region && !activeCircuit) return null;

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-100 max-w-sm w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shadow-[0_0_8px]"
            style={{
              backgroundColor: region ? region.colorHex : activeCircuit?.color,
              boxShadow: `0 0 10px ${region ? region.colorHex : activeCircuit?.color}`,
            }}
          />
          <h3 className="text-sm font-bold text-white truncate">
            {region
              ? language === 'bn'
                ? region.nameBn
                : region.nameEn
              : activeCircuit
              ? language === 'bn'
                ? activeCircuit.nameBn
                : activeCircuit.nameEn
              : ''}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* If Brain Region Selected */}
      {region && (
        <div className="flex flex-col gap-2.5 text-xs">
          <p className="text-slate-300 leading-relaxed">
            {language === 'bn' ? region.descriptionBn : region.descriptionEn}
          </p>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">FIRING FREQUENCY</span>
              <span className="text-sm font-bold text-cyan-300">
                {region.currentFiringHz.toFixed(1)} Hz
              </span>
              <span className="text-[9px] text-slate-400 block">
                Base: {region.baselineFiringHz} Hz
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">ACTIVATION LEVEL</span>
              <span className="text-sm font-bold text-emerald-400">
                {Math.round(region.activationLevel * 100)}%
              </span>
              <span className="text-[9px] text-slate-400 block capitalize">
                {region.category}
              </span>
            </div>
          </div>

          {/* Cell Types */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {language === 'bn' ? 'কোষীয় গঠন (Histology):' : 'Cellular Composition:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {region.cellTypes.map((cell) => (
                <span
                  key={cell}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                >
                  {cell}
                </span>
              ))}
            </div>
          </div>

          {/* Dominant Neurotransmitters */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {language === 'bn' ? 'প্রধান নিউরোট্রান্সমিটার:' : 'Dominant Transmitters:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {region.dominantTransmitters.map((nt) => (
                <span
                  key={nt}
                  className="px-2 py-0.5 rounded bg-indigo-950/80 text-[10px] text-indigo-300 border border-indigo-800 capitalize"
                >
                  {nt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* If Neural Circuit Selected */}
      {activeCircuit && (
        <div className="flex flex-col gap-2.5 text-xs">
          <p className="text-slate-300 leading-relaxed">
            {language === 'bn' ? activeCircuit.functionBn : activeCircuit.functionEn}
          </p>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono block">PATHWAY TRACT</span>
            <span className="text-[11px] text-cyan-300 font-medium">
              {language === 'bn'
                ? activeCircuit.pathWayDescriptionBn
                : activeCircuit.pathWayDescriptionEn}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Primary Chemical:</span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono uppercase text-[10px] border border-purple-800">
              {activeCircuit.transmitter}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
