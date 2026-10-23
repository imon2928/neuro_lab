/**
 * SynapseLab 3D - Multi-Channel Clinical EEG Machine & Oscilloscope
 * Plots continuous biophysical voltage traces for 10-20 standard montage,
 * computes real-time FFT frequency band powers, and renders 2D scalp voltage topography.
 */

import React, { useEffect, useRef, useState } from 'react';
import { EEGChannelData, EEGBandPower } from '../types/neuroscience.ts';
import { Activity, Zap, Play, Pause, RefreshCw, BarChart2, Radio } from 'lucide-react';

interface EEGMonitorProps {
  channels: EEGChannelData[];
  bandPower: EEGBandPower;
  activeExperimentTitle?: string;
  language: 'en' | 'bn';
}

export const EEGMonitor: React.FC<EEGMonitorProps> = ({
  channels,
  bandPower,
  activeExperimentTitle,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [notchFilter, setNotchFilter] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(1.0); // 1x, 2x
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Render Continuous Multi-Channel EEG Oscilloscope Traces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const traceHeight = canvas.height / channels.length;

    const draw = () => {
      // Dark clinical phosphor/LCD background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw horizontal time and voltage grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#1e293b';

      // Horizontal channel separators
      for (let i = 0; i < channels.length; i++) {
        const y = i * traceHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical time grid bars (every 1 second)
      const secStep = 60 * timeScale;
      for (let x = 0; x < canvas.width; x += secStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw each EEG channel waveform
      channels.forEach((ch, idx) => {
        const centerY = idx * traceHeight + traceHeight / 2;
        const history = ch.history;

        // Channel Label on left gutter
        ctx.fillStyle = selectedChannel === ch.name ? '#38bdf8' : '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(ch.name, 8, centerY - 4);

        // Instantaneous μV read
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`${ch.currentMicrovolts > 0 ? '+' : ''}${ch.currentMicrovolts.toFixed(1)}μV`, 8, centerY + 8);

        // Trace line
        ctx.beginPath();
        ctx.strokeStyle =
          selectedChannel === ch.name
            ? '#38bdf8'
            : ch.region === 'occipital_cortex'
            ? '#22d3ee'
            : ch.region === 'pfc'
            ? '#818cf8'
            : '#10b981';
        ctx.lineWidth = 1.2;

        const xStep = (canvas.width - 70) / (history.length - 1);
        for (let i = 0; i < history.length; i++) {
          const x = 70 + i * xStep;
          // Apply voltage scale: 1 μV = 0.45 pixels (centered)
          const y = centerY - history[i] * 0.45;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      if (isRunning) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [channels, isRunning, timeScale, selectedChannel]);

  // Render 2D Scalp Topographic Isopotential Map
  useEffect(() => {
    const canvas = topoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;

    ctx.clearRect(0, 0, width, height);

    // Draw Head Outline (Nose triangle and Ear nasion)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // Head circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Nose
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - radius + 2);
    ctx.lineTo(centerX, centerY - radius - 14);
    ctx.lineTo(centerX + 10, centerY - radius + 2);
    ctx.stroke();

    // Left & Right ears
    ctx.beginPath();
    ctx.arc(centerX - radius - 2, centerY, 8, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + radius + 2, centerY, 8, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Interpolate scalp voltage potential field
    const imgData = ctx.createImageData(width, height);
    for (let py = 0; py < height; py += 2) {
      for (let px = 0; px < width; px += 2) {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          // Inverse Distance Weighting (IDW) from electrode channels
          let weightSum = 0;
          let valSum = 0;

          channels.forEach((ch) => {
            const ex = centerX + ch.x * radius * 0.88;
            const ey = centerY + ch.y * radius * 0.88;
            const d = Math.sqrt((px - ex) ** 2 + (py - ey) ** 2) + 8.0;
            const w = 1.0 / (d * d);
            weightSum += w;
            valSum += ch.currentMicrovolts * w;
          });

          const voltage = valSum / (weightSum || 1);
          // Map voltage (-25μV to +25μV) to blue -> green -> yellow -> red
          const norm = Math.max(0, Math.min(1, (voltage + 25) / 50));
          const r = Math.floor(norm > 0.5 ? (norm - 0.5) * 2 * 255 : 0);
          const g = Math.floor(norm < 0.5 ? norm * 2 * 255 : (1 - norm) * 2 * 255);
          const b = Math.floor(norm < 0.5 ? (0.5 - norm) * 2 * 255 : 0);

          // Fill 2x2 block
          for (let dy2 = 0; dy2 < 2; dy2++) {
            for (let dx2 = 0; dx2 < 2; dx2++) {
              const idx = ((py + dy2) * width + (px + dx2)) * 4;
              imgData.data[idx] = r;
              imgData.data[idx + 1] = g;
              imgData.data[idx + 2] = b;
              imgData.data[idx + 3] = 160; // Semi-transparent
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Re-stroke boundary circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Plot electrode positions
    channels.forEach((ch) => {
      const ex = centerX + ch.x * radius * 0.88;
      const ey = centerY + ch.y * radius * 0.88;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(ch.name, ex - 6, ey - 5);
    });
  }, [channels]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {language === 'bn' ? 'ক্লিনিক্যাল ১০-২০ ডিজিটাল ইইজি মেশিন' : 'Clinical 10-20 Digital EEG Machine'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                13-CH REALTIME
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'মস্তিষ্কের বৈদ্যুতিক বিভব (μV) ও কম্পাঙ্ক বিশ্লেষণ (FFT Power Spectrum)'
                : 'Biophysical microvolt telemetry & Fast Fourier spectral bands'}
            </p>
          </div>
        </div>

        {/* Oscilloscope Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? (language === 'bn' ? 'স্থগিত' : 'Pause') : (language === 'bn' ? 'চালু' : 'Resume')}</span>
          </button>

          <button
            onClick={() => setNotchFilter(!notchFilter)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
              notchFilter
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            50Hz Notch: {notchFilter ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setTimeScale(timeScale === 1.0 ? 1.5 : 1.0)}
            className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            Speed: {timeScale}x
          </button>
        </div>
      </div>

      {/* Main Grid: Waveform Screen + Topographic Scalp Map & Spectral Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Oscilloscope Waveform Canvas (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 border-b border-slate-900 font-mono">
            <span>CHANNELS: Fp1, Fp2, F3, F4, C3, Cz, C4, T3, T4, P3, P4, O1, O2</span>
            <span>SCALE: 50 μV/div | 30 mm/sec</span>
          </div>
          <div className="relative w-full h-[280px]">
            <canvas
              ref={canvasRef}
              width={760}
              height={280}
              className="w-full h-full block"
            />
          </div>
        </div>

        {/* Right Panel: 2D Scalp Map & EEG Band Power (1 col) */}
        <div className="flex flex-col gap-3">
          {/* 2D Scalp Voltage Map */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2.5 flex flex-col items-center">
            <span className="text-[11px] font-mono text-slate-300 mb-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              {language === 'bn' ? 'স্ক্যাল্প ভোল্টেজ টপোগ্রাফি' : 'Scalp Potential Field'}
            </span>
            <canvas
              ref={topoCanvasRef}
              width={160}
              height={160}
              className="rounded-full shadow-inner"
            />
            <div className="flex items-center justify-between w-full text-[9px] text-slate-400 font-mono mt-1 px-2">
              <span className="text-blue-400">-25μV</span>
              <span className="text-emerald-400">0μV</span>
              <span className="text-rose-400">+25μV</span>
            </div>
          </div>

          {/* Spectral Frequency Bands */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'bn' ? 'ব্রেইন ওয়েভ বর্ণালী (FFT)' : 'Spectral Bands'}
              </span>
            </div>

            {/* Delta */}
            <div className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-purple-400">δ Delta (0.5-4 Hz)</span>
                <span className="font-mono">{Math.round(bandPower.delta * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bandPower.delta * 100)}%` }}
                />
              </div>
            </div>

            {/* Theta */}
            <div className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-blue-400">θ Theta (4-8 Hz)</span>
                <span className="font-mono">{Math.round(bandPower.theta * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bandPower.theta * 100)}%` }}
                />
              </div>
            </div>

            {/* Alpha */}
            <div className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-emerald-400">α Alpha (8-12 Hz)</span>
                <span className="font-mono">{Math.round(bandPower.alpha * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bandPower.alpha * 100)}%` }}
                />
              </div>
            </div>

            {/* Beta */}
            <div className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-amber-400">β Beta (13-30 Hz)</span>
                <span className="font-mono">{Math.round(bandPower.beta * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bandPower.beta * 100)}%` }}
                />
              </div>
            </div>

            {/* Gamma */}
            <div className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-rose-400">γ Gamma (30-80 Hz)</span>
                <span className="font-mono">{Math.round(bandPower.gamma * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, bandPower.gamma * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
