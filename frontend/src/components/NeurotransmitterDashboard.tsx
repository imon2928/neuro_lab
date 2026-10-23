/**
 * SynapseLab 3D - Neurotransmitter Chemical Dashboard & Synaptic E/I Balance
 * Displays real-time concentrations, chemical formulas, and biophysical roles.
 */

import React from 'react';
import { NeurotransmitterState, NeurotransmitterType } from '../types/neuroscience.ts';
import { Beaker, TrendingUp, TrendingDown, Scale, ShieldAlert } from 'lucide-react';

interface NeurotransmitterDashboardProps {
  neurotransmitters: Record<NeurotransmitterType, NeurotransmitterState>;
  language: 'en' | 'bn';
}

export const NeurotransmitterDashboard: React.FC<NeurotransmitterDashboardProps> = ({
  neurotransmitters,
  language,
}) => {
  const glu = neurotransmitters.glutamate?.concentration ?? 65;
  const gaba = neurotransmitters.gaba?.concentration ?? 58;
  const eiRatio = Number((glu / (gaba || 1)).toFixed(2));

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
            <Beaker className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              {language === 'bn' ? 'বায়োকেমিক্যাল নিউরোট্রান্সমিটার মাত্রা' : 'Biochemical Neurotransmitter State'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === 'bn' ? 'সাইন্যাপটিক ঘনত্ব (nM) ও E/I অনুপাত' : 'Quantal synaptic concentrations (nM)'}
            </p>
          </div>
        </div>

        {/* E/I Balance Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">E/I Balance:</span>
          <span
            className={`font-bold ${
              eiRatio > 1.35
                ? 'text-rose-400'
                : eiRatio < 0.85
                ? 'text-blue-400'
                : 'text-emerald-400'
            }`}
          >
            {eiRatio}
          </span>
        </div>
      </div>

      {/* Grid of 6 Neurotransmitters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {(Object.values(neurotransmitters) as NeurotransmitterState[]).map((nt) => {
          const deltaFromBase = nt.concentration - nt.baseline;
          const percentChange = Math.round((deltaFromBase / nt.baseline) * 100);
          const isElevated = percentChange >= 5;
          const isDepleted = percentChange <= -5;

          return (
            <div
              key={nt.type}
              className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white truncate">
                    {language === 'bn' ? nt.nameBn.split(' ')[0] : nt.nameEn.split(' ')[0]}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: nt.color }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">{nt.formula}</span>
              </div>

              <div className="mt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-mono font-bold text-white">
                    {nt.concentration.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">nM</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden my-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (nt.concentration / 120) * 100)}%`,
                      backgroundColor: nt.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Base {nt.baseline}</span>
                  <span
                    className={`flex items-center ${
                      isElevated
                        ? 'text-rose-400'
                        : isDepleted
                        ? 'text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isElevated ? (
                      <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                    ) : isDepleted ? (
                      <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />
                    ) : null}
                    {percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
