/**
 * SynapseLab 3D - Cognitive & Behavioral Experiment Scenarios
 * Includes detailed mathematical models for short-form video / reels consumption,
 * deep focus, meditation, cerebellar motor learning, and custom user experiments.
 */

import { ExperimentScenario } from '../types/neuroscience.ts';

export const EXPERIMENT_PRESETS: ExperimentScenario[] = [
  {
    id: 'reels_binge',
    titleEn: 'Prolonged Reels / Short-Form Video Scrolling (1-4 Hours)',
    titleBn: 'ধারাবাহিক রিলস ও শর্ট-ভিডিও স্ক্রলিং পরীক্ষা (১-৪ ঘণ্টা)',
    durationMinutes: 120,
    descriptionEn: 'Simulates the neurobiological cascade when a human consumes rapid 15-second hyper-stimulating algorithmic video feeds continuously.',
    descriptionBn: '১৫ সেকেন্ডের অ্যালগরিদমিক দ্রুত উদ্দীপক ভিডিও একটানা কয়েক ঘণ্টা দেখলে মস্তিষ্কে যে পরিবর্তন ঘটে তার বাস্তব বৈজ্ঞানিক সিমুলেশন।',
    mechanismEn: 'Phasic dopaminergic surges from variable-ratio reward schedules trigger rapid tolerance, followed by prefrontal cortex metabolic fatigue, downregulation of D2 receptors, visual sensory overload, and alpha-theta brain fog.',
    mechanismBn: 'অপ্রত্যাশিত নতুন ভিডিও আসার কারণে ভিটিএ থেকে আকস্মিক ডোপামিন নিঃসরণ, পরবর্তীতে ডি২ রিসেপ্টর নিষ্ক্রিয়করণ এবং প্রিফ্রন্টাল কর্টেক্সের তীব্র ক্লান্তি ও হাইপোফ্রন্টালিটি সৃষ্টি হয়।',
    circuitWeights: {
      mesolimbic_reward: 0.95,
      visual_pathway: 0.92,
      central_executive: 0.28,
      dmn_default: 0.22,
      stress_arousal: 0.65,
      cerebellar_loop: 0.35,
    },
    transmitterModifiers: {
      dopamine: 1.65,      // Initial intense surge
      glutamate: 1.35,     // Visual cortex excitation
      gaba: 0.70,          // Inhibitory control breakdown
      norepinephrine: 1.25, // Micro-stress from rapid cuts
      serotonin: 0.65,     // Decreased satiety / dysphoria
      acetylcholine: 0.45, // Depleted sustained focus
    },
    eegBias: {
      delta: 0.65, // Late phase drowsiness / fatigue intrusion
      theta: 0.55, // Mind-wandering fragmentation
      alpha: 0.20, // Suppressed natural resting alpha
      beta: 0.75,  // High digital agitation & sensory tension
      gamma: 0.85, // Rapid sensory flashing visual binding
    },
    expectedOutcomesEn: [
      'Early Dopamine Surge (+65%) followed by precipitous crash below baseline (-40%) at 90+ minutes.',
      'Significant Prefrontal Cortex (PFC) hypofrontality: loss of voluntary willpower and focus.',
      'Visual cortex (Occipital) hyper-metabolic strain with elevated high-beta/gamma power.',
      'Suppression of hippocampal memory consolidation—scrolled videos are almost instantly forgotten.',
      'Emergence of sleep-deprivation-like frontal theta bursts while still awake (digital trance).',
    ],
    expectedOutcomesBn: [
      'প্রথম দিকে ডোপামিনের তীব্র বৃদ্ধি (+৬৫%) এবং ৯০ মিনিট পর তা স্বাভাবিকের নিচে নেমে চরম ঘাটতি (-৪০%) তৈরি করে।',
      'প্রিফ্রন্টাল কর্টেক্সে তীব্র ক্লান্তি (Hypofrontality): ইচ্ছা শক্তি এবং সিদ্ধান্ত নেওয়ার ক্ষমতা ভেঙে পড়ে।',
      'অক্সিপিটাল ভিজ্যুয়াল কর্টেক্সে অতিরিক্ত লোড এবং গামা তরঙ্গের কৃত্রিম উত্তেজনা তৈরি হয়।',
      'হিপ্পোক্যাম্পাস মেমোরি ব্লক হয়ে যায়—ভিডিওগুলো দেখার কিছুক্ষণ পরই মানুষ ভুলে যায়।',
      'জাগ্রত অবস্থাতেই মস্তিষ্কে চরম ক্লান্তির থিটা ও ডেল্টা তরঙ্গের অনুপ্রবেশ ঘটে (ডিজিটাল ক্লান্তি)।',
    ],
    phases: [
      {
        minute: 0,
        titleEn: 'Baseline Rest (T=0m)',
        titleBn: 'স্বাভাবিক অবস্থা (০ মিনিট)',
        summaryEn: 'Subject is alert and rested. Homeostatic balance between excitation and inhibition.',
        summaryBn: 'মস্তিষ্ক শান্ত ও স্বাভাবিক। সুষম নিউরোট্রান্সমিটার মাত্রা।',
        dopamine: 50,
        pfcActivity: 0.55,
        visualActivity: 0.45,
        fatigueLevel: 0.10,
      },
      {
        minute: 20,
        titleEn: 'Novelty Hunting & Dopamine Spike (T=20m)',
        titleBn: 'নতুন কনটেন্টের আকর্ষণ ও ডোপামিন বৃদ্ধি (২০ মিনিট)',
        summaryEn: 'VTA burst-firing drives mesolimbic dopamine to peak levels (82 nM). Variable reward schedule triggers compulsive finger swiping.',
        summaryBn: 'ভিটিএ থেকে প্রচুর ডোপামিন নিঃসৃত হচ্ছে (৮২ nM)। প্রতি নতুন ভিডিওতে কৌতূহল ও আনন্দ বাড়ছে।',
        dopamine: 82,
        pfcActivity: 0.50,
        visualActivity: 0.85,
        fatigueLevel: 0.25,
      },
      {
        minute: 60,
        titleEn: 'Attentional Fragmentation & Tolerance (T=60m)',
        titleBn: 'মনোযোগের বিভাজন ও সহনশীলতা বৃদ্ধি (৬০ মিনিট)',
        summaryEn: 'Receptors downregulate. Dopamine starts dropping. Prefrontal executive control diminishes. Visual processing is saturated.',
        summaryBn: 'রিসেপ্টরগুলো সহনশীল হয়ে যাচ্ছে। ডোপামিন কমতে শুরু করেছে। প্রিফ্রন্টাল কর্টেক্সের কাজের ক্ষমতা কমছে।',
        dopamine: 60,
        pfcActivity: 0.38,
        visualActivity: 0.90,
        fatigueLevel: 0.55,
      },
      {
        minute: 120,
        titleEn: 'Hypofrontality & Digital Exhaustion (T=120m)',
        titleBn: 'হাইপোফ্রন্টালিটি ও মস্তিষ্কের চরম ক্লান্তি (১২০ মিনিট)',
        summaryEn: 'Dopamine crashes to 32 nM. Severe PFC exhaustion (hypofrontality). High theta/delta EEG intrusion. Inability to detach from screen.',
        summaryBn: 'ডোপামিন স্বাভাবিকের চেয়ে নিচে ৩২ nM এ নেমে গেছে। ডিসিশন মেকিং ক্ষমতা প্রায় অবশ। ব্রেন ফগ ও অস্বস্তি শুরু।',
        dopamine: 32,
        pfcActivity: 0.22,
        visualActivity: 0.88,
        fatigueLevel: 0.88,
      },
    ],
  },
  {
    id: 'deep_focus',
    titleEn: 'Deep Cognitive Problem Solving & Analytical Logic',
    titleBn: 'গভীর বৈজ্ঞানিক ও গাণিতিক একাগ্রতা পরীক্ষা',
    durationMinutes: 60,
    descriptionEn: 'Sustained top-down cognitive control during mathematical deduction, programming, or scientific writing.',
    descriptionBn: 'জটিল সমস্যা সমাধান, গণিত বা বৈজ্ঞানিক গবেষণায় নিমগ্ন থাকার সময় মস্তিষ্কের প্রক্রিয়া।',
    mechanismEn: 'Bilateral dorsolateral PFC and posterior parietal cortex recruitment; cholinergic neuromodulation sharpens signal-to-noise ratio while suppressing the Default Mode Network.',
    mechanismBn: 'দ্বিপাক্ষিক ডরসোলেটারাল পিএফসি এবং প্যারাইটাল কর্টেক্স সক্রিয় হয়ে অপ্রয়োজনীয় চিন্তা বন্ধ করে সুনির্দিষ্ট মনোযোগ ধরে রাখে।',
    circuitWeights: {
      central_executive: 0.92,
      mesolimbic_reward: 0.45,
      visual_pathway: 0.50,
      dmn_default: 0.15,
      stress_arousal: 0.35,
      cerebellar_loop: 0.40,
    },
    transmitterModifiers: {
      acetylcholine: 1.70, // Enhanced signal gating
      glutamate: 1.40,     // Working memory persistence
      dopamine: 1.20,      // Sustained task motivation
      gaba: 1.25,          // Suppression of distracting circuits
      norepinephrine: 0.90,
      serotonin: 1.10,
    },
    eegBias: {
      delta: 0.10,
      theta: 0.35, // Frontal midline theta for memory retrieval
      alpha: 0.25, // Desynchronized active processing
      beta: 0.85,  // Prominent frontal-central beta (18-24 Hz)
      gamma: 0.60,
    },
    expectedOutcomesEn: [
      'High sustained frontal-central Beta wave synchronization (18-28 Hz).',
      'Significant elevation of prefrontal fNIRS oxygenation (HbO) showing active metabolic perfusion.',
      'Marked deactivation of the Default Mode Network (DMN).',
      'Stable tonic dopamine preventing restlessness or impulsive task-switching.',
    ],
    expectedOutcomesBn: [
      'ফ্রন্টাল-সেন্ট্রাল অঞ্চলে শক্তিশালী বিটা তরঙ্গের সুষম সমন্বয়।',
      'পিএফসি অঞ্চলে রক্তের অক্সিজেন ও গ্লুকোজ সরবরাহ বৃদ্ধি (fNIRS HbO বৃদ্ধি)।',
      'ডিফল্ট মোড নেটওয়ার্ক সম্পূর্ণ শান্ত থাকা—মন অন্যদিকে বিক্ষিপ্ত না হওয়া।',
      'স্থিতিশীল টনিক ডোপামিন দীর্ঘক্ষণ কাজ করার স্থিতিশীল মনোযোগ বজায় রাখে।',
    ],
    phases: [
      { minute: 0, titleEn: 'Task Formulation', titleBn: 'কাজের প্রস্তুতি', summaryEn: 'Defining objective and activating schemas.', summaryBn: 'সমস্যার রূপরেখা নির্ধারণ।', dopamine: 52, pfcActivity: 0.60, visualActivity: 0.50, fatigueLevel: 0.10 },
      { minute: 25, titleEn: 'Deep Flow State', titleBn: 'গভীর নিমগ্নতা (Flow State)', summaryEn: 'Peak acetylcholine and glutamate coordination. Distractions blocked.', summaryBn: 'মনোযোগের সর্বোচ্চ শিখর।', dopamine: 62, pfcActivity: 0.90, visualActivity: 0.45, fatigueLevel: 0.25 },
      { minute: 60, titleEn: 'Solution Synthesis', titleBn: 'সমাধান ও সমাপ্তি', summaryEn: 'Problem resolved; dopamine reward release upon completion.', summaryBn: 'সাফল্যের সন্তুষ্টি ও সমাধান লাভ।', dopamine: 75, pfcActivity: 0.70, visualActivity: 0.40, fatigueLevel: 0.45 },
    ],
  },
  {
    id: 'mindfulness_meditation',
    titleEn: 'Deep Mindfulness & Transcendental Meditation',
    titleBn: 'গভীর মাইন্ডফুলনেস ও মেডিটেশন পরীক্ষা',
    durationMinutes: 45,
    descriptionEn: 'Non-judgmental awareness practices causing down-regulation of the amygdala and hyper-synchronous slow alpha/theta brain rhythms.',
    descriptionBn: 'ধ্যান ও সচেতন শ্বাসপ্রশ্বাসের মাধ্যমে মানসিক চাপ কমানো এবং মস্তিষ্কে প্রশান্তিময় আলফা তরঙ্গের উদ্ভব।',
    mechanismEn: 'Enhancement of GABAergic interneuron firing, downregulation of locus coeruleus noradrenaline, robust synchronization of occipito-parietal 10Hz Alpha and frontal midline 6Hz Theta.',
    mechanismBn: 'জিএবিএ (GABA) নিঃসরণ বৃদ্ধির মাধ্যমে অতিরিক্ত চিন্তা প্রশমন এবং মস্তিষ্কে শান্ত আলফা ও থিটা তরঙ্গের আধিপত্য।',
    circuitWeights: {
      dmn_default: 0.20,
      stress_arousal: 0.15,
      mesolimbic_reward: 0.35,
      central_executive: 0.60,
      visual_pathway: 0.20,
      cerebellar_loop: 0.45,
    },
    transmitterModifiers: {
      gaba: 1.80,          // Strong inhibitory calming
      serotonin: 1.50,     // Mood elevation and contentment
      norepinephrine: 0.40,// Marked stress reduction
      dopamine: 0.95,      // Tonic peace without craving
      glutamate: 0.75,     // Reduced cortical chatter
      acetylcholine: 1.10,
    },
    eegBias: {
      delta: 0.20,
      theta: 0.80, // Frontal midline theta (FmTheta)
      alpha: 0.95, // High-amplitude 10 Hz synchronous Alpha waves
      beta: 0.15,
      gamma: 0.25,
    },
    expectedOutcomesEn: [
      'Dramatic amplification of global posterior Alpha waves (8-12 Hz).',
      'Amygdala hemodynamic BOLD signal drops significantly (-55%).',
      'Substantial rise in central GABA concentration promoting physiological restorative state.',
      'Heart rate variability (HRV) increase mediated via vagal brainstem parasympathetic efferents.',
    ],
    expectedOutcomesBn: [
      'সমগ্র মস্তিষ্কে বিশেষত পেছনের অংশে ১০ হার্টজ আলফা তরঙ্গের চমৎকার বিস্তার।',
      'অ্যামিগডালার রক্তপ্রবাহ ও উত্তেজনা হ্রাস (-৫৫%)।',
      'জিএবিএ (GABA) এবং সেরোটোনিনের বৃদ্ধি মানসিক প্রশান্তি এনে দেয়।',
      'প্যারাসিম্প্যাথেটিক স্নায়ুতন্ত্র সক্রিয় হয়ে হৃৎস্পন্দন ও রক্তচাপ নিয়ন্ত্রণে আসে।',
    ],
    phases: [
      { minute: 0, titleEn: 'Settling Posture', titleBn: 'ধ্যানের শুরু', summaryEn: 'Closing eyes and focusing on breathing.', summaryBn: 'চোখ বন্ধ ও গভীর শ্বাস।', dopamine: 50, pfcActivity: 0.50, visualActivity: 0.30, fatigueLevel: 0.20 },
      { minute: 20, titleEn: 'High Alpha Synchrony', titleBn: 'আলফা তরঙ্গের বিস্তার', summaryEn: 'Cortical quietude. Visual cortex idling rhythm at 10 Hz.', summaryBn: 'মস্তিষ্ক শান্ত ও আলফা তরঙ্গে পরিপূর্ণ।', dopamine: 48, pfcActivity: 0.45, visualActivity: 0.18, fatigueLevel: 0.10 },
      { minute: 45, titleEn: 'Deep Restorative Stillness', titleBn: 'পরম প্রশান্তি', summaryEn: 'Theta-alpha coherence, elevated GABA, minimal metabolic wear.', summaryBn: 'পরিপূর্ণ বিশ্রাম ও শক্তি পুনরুদ্ধার।', dopamine: 52, pfcActivity: 0.40, visualActivity: 0.15, fatigueLevel: 0.05 },
    ],
  },
  {
    id: 'cerebellar_motor_learning',
    titleEn: 'Cerebellar Synaptic Learning & Motor Timing (PDF Spec)',
    titleBn: 'সেরিবিলার মোটর লার্নিং ও সাইন্যাপটিক ভেসিকল পরীক্ষা',
    durationMinutes: 30,
    descriptionEn: 'Microscopic biophysical simulation of cerebellar Purkinje-parallel fiber synaptic plasticity and SNARE vesicle fusion based on uploaded medical document.',
    descriptionBn: 'ব্যবহারকারীর আপলোড করা ডকুমেন্টের ভিত্তিতে সেরিবেলামের পার্কিঞ্জি সেল, সমান্তরাল ফাইবার এবং সাইন্যাপটিক ভেসিকল প্রোটিনের কার্যপদ্ধতি।',
    mechanismEn: 'Climbing fibers from inferior olive provide error training signals (complex spikes); mossy fibers excite granule cells (VGLUT2/Glutamate). Synaptotagmin-1 Ca²⁺ sensor triggers SNARE (Synaptobrevin + Syntaxin + SNAP-25) exocytosis.',
    mechanismBn: 'ইনফিরিয়র অলিভ থেকে ক্লাইম্বিং ফাইবার ত্রুটির সংকেত পাঠায়; মসি ফাইবার গ্র্যানিউল কোষে গ্লুটামেট নির্গমন করে এবং পার্কিঞ্জি কোষে সাইন্যাপটিক প্লাস্টিসিটি তৈরি করে।',
    circuitWeights: {
      cerebellar_loop: 0.98,
      central_executive: 0.40,
      visual_pathway: 0.55,
      mesolimbic_reward: 0.50,
      stress_arousal: 0.30,
      dmn_default: 0.15,
    },
    transmitterModifiers: {
      glutamate: 1.65, // Mossy fiber & parallel fiber excitation
      gaba: 1.75,      // Purkinje cell inhibitory output to DCN
      dopamine: 1.10,
      acetylcholine: 1.25,
      norepinephrine: 0.85,
      serotonin: 1.05,
    },
    eegBias: {
      delta: 0.15,
      theta: 0.40,
      alpha: 0.35,
      beta: 0.70, // Sensorimotor Mu/Beta rhythm modulation
      gamma: 0.65,
    },
    expectedOutcomesEn: [
      'Purkinje cell firing rate modulates from 35 Hz to 75 Hz complex spikes.',
      'SNARE complex assembly driven by Synaptobrevin (VAMP) and SNAP-25 vesicle fusion.',
      'Munc13-3 priming of cerebellar parallel fiber vesicles with high release fidelity.',
      'Sensorimotor error reduction through Long-Term Depression (LTD) at parallel fiber synapses.',
    ],
    expectedOutcomesBn: [
      'পার্কিঞ্জি সেলের জটিল স্পাইক বৃদ্ধি (৩৫ হার্টজ থেকে ৭৫ হার্টজ)।',
      'সিন্যাপটোব্রেভিন (VAMP) এবং SNAP-25 এর মাধ্যমে সফল ভেসিকল নির্গমন।',
      'Munc13-3 প্রোটিনের সহায়তায় ভেসিকল প্রাইমিং সম্পন্ন হওয়া।',
      'লং টার্ম ডিপ্রেশনের মাধ্যমে সূক্ষ্ম শারীরিক নিয়ন্ত্রণের ভুল সংশোধন।',
    ],
    phases: [
      { minute: 0, titleEn: 'Baseline Motor Signal', titleBn: 'প্রাথমিক মোটর সিগন্যাল', summaryEn: 'Standard baseline firing in granule and Golgi cells.', summaryBn: 'গ্র্যানিউল ও গলগি সেলের সাধারণ ফায়ারিং।', dopamine: 50, pfcActivity: 0.50, visualActivity: 0.50, fatigueLevel: 0.15 },
      { minute: 15, titleEn: 'Climbing Fiber Error Correction', titleBn: 'ক্লাইম্বিং ফাইবার ত্রুটি সংশোধন', summaryEn: 'Inferior olive sends powerful glutamatergic complex spikes.', summaryBn: 'ক্লাইম্বিং ফাইবার থেকে পার্কিঞ্জি সেলে শক্তিশালী সংকেত।', dopamine: 54, pfcActivity: 0.55, visualActivity: 0.60, fatigueLevel: 0.25 },
      { minute: 30, titleEn: 'Fine-Tuned Motor Memory', titleBn: 'মোটর মেমোরি সংরক্ষণ', summaryEn: 'Deep cerebellar nuclei calibrated for fluid, automated execution.', summaryBn: 'ডিপ সেরিবিলার নিউক্লিয়াসে নির্ভুল সঞ্চালন সংরক্ষিত।', dopamine: 58, pfcActivity: 0.52, visualActivity: 0.45, fatigueLevel: 0.35 },
    ],
  },
];
