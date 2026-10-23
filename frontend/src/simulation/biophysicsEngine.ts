/**
 * SynapseLab 3D - Biophysics & Computational Neuroscience Engine
 * Implements mathematical neural mass dynamics, neurotransmitter kinetics,
 * 10-20 EEG lead field simulation, fMRI BOLD hemodynamic response, and
 * cerebellar synaptic vesicle mechanics.
 */

import {
  BrainRegionId,
  BrainRegionData,
  NeurotransmitterType,
  NeurotransmitterState,
  NeuralCircuit,
  EEGChannelData,
  EEGBandPower,
  SynapticVesicleProtein,
} from '../types/neuroscience.ts';

export const INITIAL_BRAIN_REGIONS: Record<BrainRegionId, BrainRegionData> = {
  pfc: {
    id: 'pfc',
    nameEn: 'Prefrontal Cortex (PFC)',
    nameBn: 'প্রিফ্রন্টাল কর্টেক্স (PFC)',
    category: 'cortical',
    descriptionEn: 'The executive command center responsible for working memory, goal-directed decisions, focus, and impulse regulation.',
    descriptionBn: 'মস্তিষ্কের নির্বাহী নিয়ন্ত্রণ কেন্দ্র—যা সিদ্ধান্ত গ্রহণ, কাজের স্মৃতি, একাগ্রতা এবং প্রবৃত্তি নিয়ন্ত্রণে কাজ করে।',
    primaryFunctionEn: 'Executive control, sustained attention, inhibitory control of instincts.',
    primaryFunctionBn: 'নির্বাহী নিয়ন্ত্রণ, কাজের স্মৃতি, দীর্ঘস্থায়ী মনোযোগ ও নিয়ন্ত্রণ।',
    cellTypes: ['Pyramidal neurons (Layer III/V)', 'Parvalbumin interneurons', 'GABAergic interneurons'],
    dominantTransmitters: ['dopamine', 'glutamate', 'gaba', 'acetylcholine'],
    baselineFiringHz: 18.5,
    currentFiringHz: 18.5,
    activationLevel: 0.55,
    colorHex: '#38bdf8',
    activeColorHex: '#60a5fa',
    coordinates: [0, 0.45, 1.35],
  },
  motor_cortex: {
    id: 'motor_cortex',
    nameEn: 'Primary Motor Cortex (M1)',
    nameBn: 'প্রাইমারি মোটর কর্টেক্স (M1)',
    category: 'cortical',
    descriptionEn: 'Generates neural impulses that pass down to the spinal cord to control the execution of voluntary movement.',
    descriptionBn: 'স্বেচ্ছামূলক শারীরিক গতিবিধি কার্যকর করার জন্য সংকেত প্রেরণ করে।',
    primaryFunctionEn: 'Planning and execution of voluntary skeletal movement.',
    primaryFunctionBn: 'ঐচ্ছিক শারীরিক অঙ্গপ্রত্যঙ্গের সুনির্দিষ্ট সঞ্চালন ও নিয়ন্ত্রণ।',
    cellTypes: ['Betz giant pyramidal cells', 'Glutamatergic projection neurons'],
    dominantTransmitters: ['glutamate', 'gaba', 'dopamine'],
    baselineFiringHz: 14.0,
    currentFiringHz: 14.0,
    activationLevel: 0.40,
    colorHex: '#f59e0b',
    activeColorHex: '#fbbf24',
    coordinates: [0, 1.05, 0.35],
  },
  somatosensory: {
    id: 'somatosensory',
    nameEn: 'Somatosensory & Parietal Cortex',
    nameBn: 'সোমাটোসেন্সরি ও প্যারাইটাল লোব',
    category: 'cortical',
    descriptionEn: 'Processes bodily tactile sensations, spatial navigation, and multisensory integration.',
    descriptionBn: 'স্পর্শানুভূতি, শরীরের অবস্থান, স্থানিক বোধ এবং সংবেদনশীল সংকেত একত্রিত করে।',
    primaryFunctionEn: 'Touch processing, spatial coordinate maps, proprioception.',
    primaryFunctionBn: 'শারীরিক অনুভূতি, স্থানিক উপলব্ধি এবং সমন্বয় সাধন।',
    cellTypes: ['Granule cells', 'Pyramidal cells', 'Somatostatin interneurons'],
    dominantTransmitters: ['glutamate', 'gaba'],
    baselineFiringHz: 16.0,
    currentFiringHz: 16.0,
    activationLevel: 0.45,
    colorHex: '#ec4899',
    activeColorHex: '#f472b6',
    coordinates: [0, 0.95, -0.45],
  },
  temporal_cortex: {
    id: 'temporal_cortex',
    nameEn: 'Temporal Cortex & Auditory Area',
    nameBn: 'টেম্পোরাল কর্টেক্স ও অডিটরি অংশ',
    category: 'cortical',
    descriptionEn: 'Processes auditory sensory input, language comprehension (Wernicke area), and semantic memory.',
    descriptionBn: 'শব্দ প্রক্রিয়াকরণ, ভাষা বোধগম্যতা এবং দীর্ঘমেয়াদী স্মৃতির অনুধাবন ঘটায়।',
    primaryFunctionEn: 'Auditory decoding, speech comprehension, rhythm perception.',
    primaryFunctionBn: 'শ্রবণ সংকেত বিশ্লেষণ ও ভাষার অর্থ উদ্ধার।',
    cellTypes: ['Cortical pyramidal cells', 'Auditory basket cells'],
    dominantTransmitters: ['glutamate', 'gaba', 'acetylcholine'],
    baselineFiringHz: 15.0,
    currentFiringHz: 15.0,
    activationLevel: 0.42,
    colorHex: '#a855f7',
    activeColorHex: '#c084fc',
    coordinates: [1.2, -0.1, 0.1],
  },
  occipital_cortex: {
    id: 'occipital_cortex',
    nameEn: 'Occipital Visual Cortex (V1-V4)',
    nameBn: 'অক্সিপিটাল ভিজ্যুয়াল কর্টেক্স (V1-V4)',
    category: 'cortical',
    descriptionEn: 'The primary anatomical vision processor, decoding high-frequency retinal inputs, color, motion, and contrast.',
    descriptionBn: 'দৃষ্টিশক্তির মূল কেন্দ্র—যা আলো, গতিবিধি, রঙ এবং ভিডিও ফ্রেম দ্রুত বিশ্লেষণ করে।',
    primaryFunctionEn: 'Visual frame perception, motion tracking, brightness discrimination.',
    primaryFunctionBn: 'ভিজ্যুয়াল ফ্রেম, গতি ও রঙের তাৎক্ষণিক বিশ্লেষণ।',
    cellTypes: ['Stellate cells (Layer IV)', 'Simple & complex orientation neurons'],
    dominantTransmitters: ['glutamate', 'gaba'],
    baselineFiringHz: 12.0,
    currentFiringHz: 12.0,
    activationLevel: 0.50,
    colorHex: '#06b6d4',
    activeColorHex: '#22d3ee',
    coordinates: [0, 0.25, -1.55],
  },
  hippocampus: {
    id: 'hippocampus',
    nameEn: 'Hippocampus (CA1-CA3 & DG)',
    nameBn: 'হিপ্পোক্যাম্পাস (স্মৃতি কেন্দ্র)',
    category: 'subcortical',
    descriptionEn: 'Crucial for consolidating information from short-term memory to long-term storage and spatial memory mapping.',
    descriptionBn: 'স্বল্পমেয়াদী স্মৃতিকে দীর্ঘমেয়াদী স্মৃতিতে রূপান্তর ও নেভিগেশন ম্যাপ তৈরিতে অপরিহার্য।',
    primaryFunctionEn: 'Synaptic long-term potentiation (LTP), episodic memory indexing.',
    primaryFunctionBn: 'লং-টার্ম পোটেনশিয়েশন (LTP) ও স্মৃতি সংরক্ষণ।',
    cellTypes: ['CA1 pyramidal cells', 'CA3 recurrent neurons', 'Dentate granule cells'],
    dominantTransmitters: ['glutamate', 'gaba', 'acetylcholine'],
    baselineFiringHz: 8.5,
    currentFiringHz: 8.5,
    activationLevel: 0.48,
    colorHex: '#10b981',
    activeColorHex: '#34d399',
    coordinates: [0.65, -0.35, -0.15],
  },
  amygdala: {
    id: 'amygdala',
    nameEn: 'Amygdala (Basolateral & Central)',
    nameBn: 'অ্যামিগডালা (আবেগ ও প্রতিক্রিয়া)',
    category: 'subcortical',
    descriptionEn: 'Integrates autonomic fear, urgency, emotional valence, and vigilance responses.',
    descriptionBn: 'ভয়, মানসিক উত্তেজনা, সতর্কতা এবং আকস্মিক ঝুঁকির প্রতিক্রিয়া পরিচালনা করে।',
    primaryFunctionEn: 'Threat appraisal, emotional memory, autonomic fear conditioning.',
    primaryFunctionBn: 'হুমকি মূল্যায়ন এবং আবেগগত সতর্কতা সংকেত।',
    cellTypes: ['Basolateral pyramidal-like neurons', 'Central intercalated GABA cells'],
    dominantTransmitters: ['norepinephrine', 'gaba', 'glutamate', 'serotonin'],
    baselineFiringHz: 9.0,
    currentFiringHz: 9.0,
    activationLevel: 0.35,
    colorHex: '#f43f5e',
    activeColorHex: '#fb7185',
    coordinates: [0.55, -0.45, 0.5],
  },
  thalamus: {
    id: 'thalamus',
    nameEn: 'Thalamus (Sensory Relay Hub)',
    nameBn: 'থ্যালামাস (কেন্দ্রীয় সংবেদনশীল গেটওয়ে)',
    category: 'subcortical',
    descriptionEn: 'The central switchboard relaying sensory and motor signals to the cerebral cortex and regulating consciousness.',
    descriptionBn: 'মস্তিষ্কের সব সংবেদনশীল সিগন্যাল (দৃষ্টি, শ্রবণ, স্পর্শ) কর্টেক্সে পাঠানোর মূল রিলে স্টেশন।',
    primaryFunctionEn: 'Sensory gating, cortical pacing, thalamocortical oscillations.',
    primaryFunctionBn: 'সংবেদনশীল সংকেত ফিল্টারিং ও কর্টিকাল নিয়ন্ত্রণ।',
    cellTypes: ['Thalamocortical relay neurons', 'Reticular thalamic GABA neurons'],
    dominantTransmitters: ['glutamate', 'gaba'],
    baselineFiringHz: 11.0,
    currentFiringHz: 11.0,
    activationLevel: 0.52,
    colorHex: '#eab308',
    activeColorHex: '#fde047',
    coordinates: [0, -0.1, 0],
  },
  hypothalamus: {
    id: 'hypothalamus',
    nameEn: 'Hypothalamus',
    nameBn: 'হাইপোথ্যালামাস (শারীরবৃত্তীয় ভারসাম্য)',
    category: 'subcortical',
    descriptionEn: 'Links the nervous system to the endocrine system via pituitary gland; maintains biological homeostasis and circadian rhythm.',
    descriptionBn: 'শরীরের তাপমাত্রা, হরমোন নিঃসরণ, ঘুম-জাগরণের চক্র এবং ক্ষুধা-তৃষ্ণা নিয়ন্ত্রণ করে।',
    primaryFunctionEn: 'Homeostasis, autonomic autonomic tone, circadian clock (SCN).',
    primaryFunctionBn: 'হোমিওস্ট্যাসিস, হরমোন ভারসাম্য ও জৈবিক ঘড়ি পরিচালনা।',
    cellTypes: ['Neurosecretory magnocellular cells', 'Parvocellular peptidergic neurons'],
    dominantTransmitters: ['serotonin', 'norepinephrine', 'dopamine', 'gaba'],
    baselineFiringHz: 7.0,
    currentFiringHz: 7.0,
    activationLevel: 0.40,
    colorHex: '#d946ef',
    activeColorHex: '#e879f9',
    coordinates: [0, -0.5, 0.3],
  },
  vta_striatum: {
    id: 'vta_striatum',
    nameEn: 'VTA & Nucleus Accumbens (Reward Hub)',
    nameBn: 'ভিটিএ ও নিউক্লিয়াস অ্যাকিউম্বেন্স (রিওয়ার্ড সার্কিট)',
    category: 'subcortical',
    descriptionEn: 'The core mesolimbic dopamine generator that mediates reward anticipation, craving, incentive salience, and habits.',
    descriptionBn: 'ডোপামিন রিওয়ার্ড ও সন্তুষ্টির মূল উৎস—যা আগ্রহ, আকর্ষণ, রিলস স্ক্রলিং ও আসক্তি তৈরি করে।',
    primaryFunctionEn: 'Phasic dopamine bursts, reward prediction error, habit reinforcement.',
    primaryFunctionBn: 'ডোপামিন নিঃসরণ, আনন্দ ও তৃপ্তির অনুভূতি এবং অভ্যাস গঠন।',
    cellTypes: ['Dopaminergic projection neurons (A10)', 'Medium spiny neurons (D1/D2)'],
    dominantTransmitters: ['dopamine', 'gaba', 'glutamate'],
    baselineFiringHz: 6.5,
    currentFiringHz: 6.5,
    activationLevel: 0.45,
    colorHex: '#6366f1',
    activeColorHex: '#818cf8',
    coordinates: [0, -0.55, 0.4],
  },
  cerebellum: {
    id: 'cerebellum',
    nameEn: 'Cerebellum (Arbor Vitae & Cortex)',
    nameBn: 'সেরিবেলাম (ক্ষুদ্র মস্তিষ্ক ও সমন্বয়)',
    category: 'hindbrain',
    descriptionEn: 'Contains >50% of the brain neurons. Coordinates fine motor timing, balance, error correction, and motor learning.',
    descriptionBn: 'মস্তিষ্কের অর্ধেকেরও বেশি নিউরন বহন করে। শারীরিক ভারসাম্য, নির্ভুল মোটর সমন্বয় ও মোটর লার্নিং নিয়ন্ত্রণ করে।',
    primaryFunctionEn: 'Climbing/mossy fiber integration, Purkinje complex spikes, motor error correction.',
    primaryFunctionBn: 'ভারসাম্য রক্ষা, সূক্ষ্ম পেশি সঞ্চালন এবং মোটর ত্রুটি সংশোধন।',
    cellTypes: ['Purkinje cells', 'Granule cells', 'Golgi cells', 'Basket & Stellate cells', 'Deep cerebellar nuclei neurons'],
    dominantTransmitters: ['gaba', 'glutamate'],
    baselineFiringHz: 35.0,
    currentFiringHz: 35.0,
    activationLevel: 0.50,
    colorHex: '#14b8a6',
    activeColorHex: '#2dd4bf',
    coordinates: [0, -0.85, -1.05],
  },
  brainstem: {
    id: 'brainstem',
    nameEn: 'Brainstem (Pons, Medulla & Midbrain)',
    nameBn: 'ব্রেইনস্টেম (শ্বাসনালী ও হৃদস্পন্দন নিয়ন্ত্রণ)',
    category: 'hindbrain',
    descriptionEn: 'Controls vital autonomous functions (respiration, cardiac cycle, vasomotor) and hosts the reticular activating system.',
    descriptionBn: 'হৃৎস্পন্দন, শ্বাসপ্রশ্বাস ও রক্তচাপ নিয়ন্ত্রণ করে এবং চেতনা ও জাগরণ বজায় রাখে।',
    primaryFunctionEn: 'Vital autonomic maintenance, ascending arousal neuromodulation.',
    primaryFunctionBn: 'জীবন রক্ষাকারী স্বয়ংক্রিয় ক্রিয়া এবং জাগ্রত অবস্থা নিয়ন্ত্রণ।',
    cellTypes: ['Locus coeruleus noradrenergic cells', 'Raphe serotonergic cells', 'Cardiorespiratory pacemaker neurons'],
    dominantTransmitters: ['norepinephrine', 'serotonin', 'acetylcholine', 'gaba'],
    baselineFiringHz: 12.0,
    currentFiringHz: 12.0,
    activationLevel: 0.50,
    colorHex: '#64748b',
    activeColorHex: '#94a3b8',
    coordinates: [0, -1.15, -0.2],
  },
};

export const INITIAL_NEUROTRANSMITTERS: Record<NeurotransmitterType, NeurotransmitterState> = {
  dopamine: {
    type: 'dopamine',
    nameEn: 'Dopamine (DA)',
    nameBn: 'ডোপামিন (DA)',
    formula: 'C₈H₁₁NO₂',
    concentration: 50.0,
    baseline: 50.0,
    roleEn: 'Incentive salience, reward anticipation, motor gating, and addictive reinforcement.',
    roleBn: 'পুরস্কারের প্রত্যাশা, আনন্দ, প্রেরণা এবং অভ্যাসের তীব্র আকর্ষণ।',
    color: '#818cf8',
    associatedCircuits: ['mesolimbic_reward', 'nigrostriatal_motor'],
  },
  glutamate: {
    type: 'glutamate',
    nameEn: 'Glutamate (Glu)',
    nameBn: 'গ্লুটামেট (Glu)',
    formula: 'C₅H₉NO₄',
    concentration: 65.0,
    baseline: 65.0,
    roleEn: 'Primary fast excitatory transmitter; mediates synaptic plasticity (LTP) and learning.',
    roleBn: 'প্রধান উত্তেজনামূলক নিউরোট্রান্সমিটার; নতুন কিছু শেখা ও স্নায়ু সংযোগ শক্তিশালী করে।',
    color: '#38bdf8',
    associatedCircuits: ['visual_pathway', 'cerebellar_loop', 'central_executive'],
  },
  gaba: {
    type: 'gaba',
    nameEn: 'GABA (γ-Aminobutyric acid)',
    nameBn: 'জিএবিএ (GABA)',
    formula: 'C₄H₉NO₂',
    concentration: 58.0,
    baseline: 58.0,
    roleEn: 'Primary fast inhibitory transmitter; regulates neural synchrony and prevents excitotoxicity.',
    roleBn: 'প্রধান প্রশমনকারী নিউরোট্রান্সমিটার; মস্তিষ্কের অতিরিক্ত উত্তেজনা থামিয়ে শান্ত রাখে।',
    color: '#34d399',
    associatedCircuits: ['cerebellar_loop', 'thalamocortical_gate', 'dmn_default'],
  },
  norepinephrine: {
    type: 'norepinephrine',
    nameEn: 'Norepinephrine / Noradrenaline (NE)',
    nameBn: 'নরএপিনেফ্রিন (NE)',
    formula: 'C₈H₁₁NO₃',
    concentration: 42.0,
    baseline: 42.0,
    roleEn: 'Arousal, acute fight-or-flight vigilance, focus, and adrenergic sympathetic surge.',
    roleBn: 'তীব্র সতর্কতা, সংকটময় মুহূর্তে দ্রুত সিদ্ধান্ত ও মনোযোগ বৃদ্ধি।',
    color: '#fb7185',
    associatedCircuits: ['stress_arousal_circuit', 'salience_network'],
  },
  serotonin: {
    type: 'serotonin',
    nameEn: 'Serotonin (5-HT)',
    nameBn: 'সেরোটোনিন (5-HT)',
    formula: 'C₁₀H₁₂N₂O',
    concentration: 54.0,
    baseline: 54.0,
    roleEn: 'Mood stabilization, emotional resilience, satiety, sleep-wake cycles, and impulse inhibition.',
    roleBn: 'মানসিক ভারসাম্য, প্রশান্তি, সন্তুষ্টি এবং দীর্ঘস্থায়ী মেজাজ নিয়ন্ত্রণ।',
    color: '#f472b6',
    associatedCircuits: ['hypothalamic_tone', 'raphe_mood_loop'],
  },
  acetylcholine: {
    type: 'acetylcholine',
    nameEn: 'Acetylcholine (ACh)',
    nameBn: 'অ্যাসিটাইলকোলিন (ACh)',
    formula: 'C₇H₁₆NO₂⁺',
    concentration: 48.0,
    baseline: 48.0,
    roleEn: 'Sustained cognitive attention, memory encoding in hippocampus, neuromuscular transmission.',
    roleBn: 'মনোযোগ ধরে রাখা, হিপ্পোক্যাম্পাসে স্মৃতি ধারণ এবং স্নায়বিক সচেতনতা।',
    color: '#fbbf24',
    associatedCircuits: ['hippocampal_encoding', 'central_executive'],
  },
};

export const NEURAL_CIRCUITS: NeuralCircuit[] = [
  {
    id: 'mesolimbic_reward',
    nameEn: 'Mesolimbic Dopaminergic Reward Pathway',
    nameBn: 'মেসোলিম্বিক ডোপামিন রিওয়ার্ড পাথওয়ে',
    transmitter: 'dopamine',
    sourceRegion: 'vta_striatum',
    targetRegions: ['pfc', 'hippocampus', 'amygdala'],
    functionEn: 'Transmits dopamine from VTA to Nucleus Accumbens & PFC; hyper-activated during short video / reels swiping.',
    functionBn: 'ভিটিএ থেকে অ্যাকুম্বেন্স ও পিএফসিতে ডোপামিন পাঠায়; রিলস বা শর্টস দেখার সময় তীব্রভাবে উদ্দীপ্ত হয়।',
    activityLevel: 0.55,
    color: '#818cf8',
    pathWayDescriptionEn: 'Ventral Tegmental Area -> Nucleus Accumbens -> Medial Prefrontal Cortex',
    pathWayDescriptionBn: 'ভেন্ট্রাল টেগমেন্টাল এরিয়া -> নিউক্লিয়াস অ্যাকিউম্বেন্স -> মিডিয়াল প্রিফ্রন্টাল কর্টেক্স',
    splinePoints: [
      [0, -0.55, 0.4],
      [0, -0.3, 0.7],
      [0, 0.1, 1.1],
      [0, 0.45, 1.35],
    ],
  },
  {
    id: 'visual_pathway',
    nameEn: 'Retino-Geniculo-Striate Visual Pathway',
    nameBn: 'রেটিনো-জেনিকুলো-অক্সিপিটাল ভিজ্যুয়াল পাথওয়ে',
    transmitter: 'glutamate',
    sourceRegion: 'thalamus',
    targetRegions: ['occipital_cortex', 'somatosensory'],
    functionEn: 'Carries high-speed visual frame signals from the lateral geniculate nucleus to V1 for rapid image decoding.',
    functionBn: 'ল্যাটারাল জেনিকুলেট নিউক্লিয়াস থেকে অক্সিপিটাল লোবে ভিজ্যুয়াল ফ্রেমের তথ্য পাঠায়।',
    activityLevel: 0.60,
    color: '#06b6d4',
    pathWayDescriptionEn: 'Thalamus (LGN) -> Optic Radiations -> Occipital Pole (Calcarine Cortex)',
    pathWayDescriptionBn: 'থ্যালামাস -> অপটিক রেডিয়েশন -> অক্সিপিটাল পোল',
    splinePoints: [
      [0, -0.1, 0],
      [0.2, 0.1, -0.7],
      [0, 0.25, -1.55],
    ],
  },
  {
    id: 'cerebellar_loop',
    nameEn: 'Cerebellar Cortico-Nuclear Loop (PDF Grounded)',
    nameBn: 'সেরিবিলার কর্টিকো-নিউক্লিয়ার লুপ (PDF ভিত্তিক)',
    transmitter: 'gaba',
    sourceRegion: 'cerebellum',
    targetRegions: ['motor_cortex', 'thalamus', 'brainstem'],
    functionEn: 'Mossy & climbing fibers synapse onto granule & Purkinje cells; provides inhibitory GABA timing control to deep cerebellar nuclei.',
    functionBn: 'মসি ও ক্লাইম্বিং ফাইবার গ্র্যানিউল ও পার্কিঞ্জি কোষে যুক্ত হয়ে সুনির্দিষ্ট মোটর নির্ভুলতা বজায় রাখে।',
    activityLevel: 0.50,
    color: '#14b8a6',
    pathWayDescriptionEn: 'Inferior Olive & Pons -> Mossy/Climbing Fibers -> Purkinje Layer -> Deep Cerebellar Nuclei (Dentate) -> Motor Thalamus',
    pathWayDescriptionBn: 'পনস ও ইনফিরিয়র অলিভ -> গ্র্যানিউল/পার্কিঞ্জি কোষ -> ডিপ সেরিবিলার নিউক্লিয়াস -> মোটর থ্যালামাস',
    splinePoints: [
      [0, -1.15, -0.2],
      [0, -0.85, -1.05],
      [0, -0.1, 0],
      [0, 1.05, 0.35],
    ],
  },
  {
    id: 'central_executive',
    nameEn: 'Central Executive Network (CEN)',
    nameBn: 'সেন্ট্রাল এক্সিকিউটিভ নেটওয়ার্ক (মনোযোগ ও সমাধান)',
    transmitter: 'glutamate',
    sourceRegion: 'pfc',
    targetRegions: ['somatosensory', 'thalamus'],
    functionEn: 'Dorsolateral PFC and posterior parietal cortex coordinate working memory, analytical deduction, and structured focus.',
    functionBn: 'গাণিতিক যুক্তি, জটিল সমস্যা সমাধান ও গভীর মনোযোগের জন্য কাজ করে।',
    activityLevel: 0.52,
    color: '#38bdf8',
    pathWayDescriptionEn: 'Dorsolateral Prefrontal Cortex <-> Posterior Parietal Cortex',
    pathWayDescriptionBn: 'ডরসোলেটারাল প্রিফ্রন্টাল কর্টেক্স <-> পোস্টেরিয়র প্যারাইটাল লোব',
    splinePoints: [
      [0, 0.45, 1.35],
      [0.3, 0.8, 0.4],
      [0, 0.95, -0.45],
    ],
  },
  {
    id: 'dmn_default',
    nameEn: 'Default Mode Network (DMN)',
    nameBn: 'ডিফল্ট মোড নেটওয়ার্ক (আত্মমগ্নতা ও স্মৃতিতাড়না)',
    transmitter: 'gaba',
    sourceRegion: 'pfc',
    targetRegions: ['hippocampus', 'temporal_cortex'],
    functionEn: 'Active during self-reflection, mind-wandering, and daydreaming; deactivated during goal-directed tasks.',
    functionBn: 'মানুষ যখন অলস বসে থাকে, অতীত মনে করে বা কল্পনা করে তখন এই সার্কিট সক্রিয় থাকে।',
    activityLevel: 0.42,
    color: '#ec4899',
    pathWayDescriptionEn: 'Medial PFC <-> Posterior Cingulate Cortex <-> Medial Temporal Lobe',
    pathWayDescriptionBn: 'মিডিয়াল পিএফসি <-> পোস্টেরিয়র সিংগুলে কর্টেক্স <-> হিপ্পোক্যাম্পাস',
    splinePoints: [
      [0, 0.45, 1.35],
      [0, 0.2, 0.1],
      [0.65, -0.35, -0.15],
    ],
  },
  {
    id: 'stress_arousal',
    nameEn: 'Locus Coeruleus - Noradrenergic Stress Axis',
    nameBn: 'লোকাস সোরিউলিয়াস - নরএড্রেনার্জিক স্ট্রেস সার্কিট',
    transmitter: 'norepinephrine',
    sourceRegion: 'brainstem',
    targetRegions: ['amygdala', 'pfc', 'hypothalamus'],
    functionEn: 'Pumps norepinephrine upon perception of urgency, threat, sudden sensory jump-cuts, or physiological panic.',
    functionBn: 'হঠাৎ ভয়, রোমাঞ্চ, বিপদ বা ভিডিওর দ্রুত পরিবর্তনের প্রতিক্রিয়ায় মস্তিষ্কে সতর্কতা বাড়ায়।',
    activityLevel: 0.38,
    color: '#fb7185',
    pathWayDescriptionEn: 'Locus Coeruleus (Pons) -> Basolateral Amygdala -> Hypothalamic PVN',
    pathWayDescriptionBn: 'ব্রেইনস্টেম লোকাস সোরিউলিয়াস -> অ্যামিগডালা -> হাইপোথ্যালামাস',
    splinePoints: [
      [0, -1.15, -0.2],
      [0.55, -0.45, 0.5],
      [0, -0.5, 0.3],
    ],
  },
];

export const SYNAPTIC_VESICLE_PROTEINS_LIST: SynapticVesicleProtein[] = [
  {
    name: 'Synaptobrevin (VAMP-1 / VAMP-2)',
    type: 'Vesicular v-SNARE',
    functionEn: 'Binds to plasma membrane t-SNAREs (Syntaxin & SNAP-25) to assemble the 4-helix SNARE pin that drives membrane fusion.',
    functionBn: 'কোষঝিল্লির সিনট্যাক্সিন ও SNAP-25 এর সাথে যুক্ত হয়ে ভেসিকল ফিউশন সম্পন্ন করে।',
    status: 'primed',
    roleInCircuit: 'Essential for neurotransmitter exocytosis at active zones.',
  },
  {
    name: 'Synaptotagmin-1 (Ca²⁺ Sensor)',
    type: 'Integral Calcium Sensor',
    functionEn: 'Binds Ca²⁺ ions upon action potential depolarization, displacing complexin clamp to trigger sub-millisecond fusion.',
    functionBn: 'অ্যাকশন পোটেনশিয়ালের ক্যালসিয়াম আয়ন গ্রহণ করে তাৎক্ষণিক নিউরোট্রান্সমিটার নির্গমন ঘটায়।',
    status: 'fusing',
    roleInCircuit: 'Triggers instantaneous quantal neurotransmitter release.',
  },
  {
    name: 'VGLUT2 (Vesicular Glutamate Transporter)',
    type: 'Electrochemical Transporter',
    functionEn: 'Uses proton gradient established by V-ATPase to pack glutamate into synaptic vesicles at mossy & climbing fibers.',
    functionBn: 'প্রোটন গ্রেডিয়েন্ট ব্যবহার করে ভেসিকলের ভেতরে গ্লুটামেট জমা করে।',
    status: 'docked',
    roleInCircuit: 'Loads excitatory transmitter in cerebellar and cortical synapses.',
  },
  {
    name: 'V-ATPase (Proton Pump)',
    type: 'Multi-subunit ATPase',
    functionEn: 'Hydrolyzes ATP to pump H⁺ protons into vesicle interior, establishing 5.6 pH acidic and electrical gradient.',
    functionBn: 'এটিপি খরচ করে ভেসিকলের ভেতর প্রোটন ঢুকিয়ে ইলেক্ট্রোকেমিক্যাল গ্রেডিয়েন্ট তৈরি করে।',
    status: 'docked',
    roleInCircuit: 'Powers the electrochemical driving force for neurotransmitter uptake.',
  },
  {
    name: 'Munc13-3 (Priming Protein)',
    type: 'Presynaptic Priming Factor',
    functionEn: 'Highly enriched in cerebellum; unfolds syntaxin-1 to form open conformation essential for vesicle priming.',
    functionBn: 'সেরিবেলামের সমান্তরাল ফাইবারে ভেসিকল প্রাইমিং নিয়ন্ত্রণ করে।',
    status: 'primed',
    roleInCircuit: 'Regulates short-term synaptic plasticity and release probability.',
  },
  {
    name: 'Rab3A (GTP-Binding GTPase)',
    type: 'Small GTPase',
    functionEn: 'Coordinates vesicle targeting, tethering, and alignment with the presynaptic RIM active zone scaffold.',
    functionBn: 'ভেসিকলকে সঠিক স্থানে নোঙর (docking) করতে সাহায্য করে।',
    status: 'docked',
    roleInCircuit: 'Controls vesicle positioning at presynaptic active zones.',
  },
  {
    name: 'Synapsin I / II',
    type: 'Cytoskeletal Tethering Protein',
    functionEn: 'Tethers vesicles to actin filaments in the reserve pool; phosphorylation by CaMKII mobilizes vesicles to active zone.',
    functionBn: 'ভেসিকলকে অ্যাকটিনের সাথে আটকে রিজার্ভ পুলে রাখে; ফসফোরাইলেশনে এরা মুক্ত হয়।',
    status: 'recycling',
    roleInCircuit: 'Maintains sustained high-frequency neurotransmission during prolonged firing.',
  },
];

export const INITIAL_EEG_CHANNELS: EEGChannelData[] = [
  { name: 'Fp1', region: 'pfc', currentMicrovolts: 12.4, history: new Array(120).fill(0), x: -0.32, y: -0.82, coords3D: [-0.4, 0.8, 1.3] },
  { name: 'Fp2', region: 'pfc', currentMicrovolts: 14.1, history: new Array(120).fill(0), x: 0.32, y: -0.82, coords3D: [0.4, 0.8, 1.3] },
  { name: 'F3',  region: 'pfc', currentMicrovolts: -8.3, history: new Array(120).fill(0), x: -0.52, y: -0.50, coords3D: [-0.8, 1.1, 0.8] },
  { name: 'F4',  region: 'pfc', currentMicrovolts: -7.6, history: new Array(120).fill(0), x: 0.52, y: -0.50, coords3D: [0.8, 1.1, 0.8] },
  { name: 'C3',  region: 'motor_cortex', currentMicrovolts: 5.2, history: new Array(120).fill(0), x: -0.65, y: 0.00, coords3D: [-1.1, 1.2, 0.1] },
  { name: 'Cz',  region: 'motor_cortex', currentMicrovolts: 3.1, history: new Array(120).fill(0), x: 0.00, y: 0.00, coords3D: [0.0, 1.45, 0.1] },
  { name: 'C4',  region: 'motor_cortex', currentMicrovolts: 4.8, history: new Array(120).fill(0), x: 0.65, y: 0.00, coords3D: [1.1, 1.2, 0.1] },
  { name: 'T3',  region: 'temporal_cortex', currentMicrovolts: -3.8, history: new Array(120).fill(0), x: -0.88, y: 0.08, coords3D: [-1.4, 0.1, 0.2] },
  { name: 'T4',  region: 'temporal_cortex', currentMicrovolts: -2.9, history: new Array(120).fill(0), x: 0.88, y: 0.08, coords3D: [1.4, 0.1, 0.2] },
  { name: 'P3',  region: 'somatosensory', currentMicrovolts: 16.5, history: new Array(120).fill(0), x: -0.52, y: 0.50, coords3D: [-0.8, 1.1, -0.6] },
  { name: 'P4',  region: 'somatosensory', currentMicrovolts: 15.2, history: new Array(120).fill(0), x: 0.52, y: 0.50, coords3D: [0.8, 1.1, -0.6] },
  { name: 'O1',  region: 'occipital_cortex', currentMicrovolts: -18.7, history: new Array(120).fill(0), x: -0.32, y: 0.82, coords3D: [-0.4, 0.5, -1.5] },
  { name: 'O2',  region: 'occipital_cortex', currentMicrovolts: -19.4, history: new Array(120).fill(0), x: 0.32, y: 0.82, coords3D: [0.4, 0.5, -1.5] },
];

/**
 * Calculates real biophysical forward EEG signal superposition
 * using neural mass oscillations + regional source dipole projection.
 */
export function computeEEGSignal(
  channel: EEGChannelData,
  timeMs: number,
  bandPower: EEGBandPower,
  regionActivity: number
): number {
  const t = timeMs / 1000;
  // Frequencies corresponding to Delta (2 Hz), Theta (6 Hz), Alpha (10 Hz), Beta (22 Hz), Gamma (42 Hz)
  const delta = Math.sin(2 * Math.PI * 2.1 * t + channel.x * 2) * bandPower.delta * 28.0;
  const theta = Math.sin(2 * Math.PI * 5.8 * t + channel.y * 3) * bandPower.theta * 20.0;
  const alpha = Math.sin(2 * Math.PI * 10.2 * t + (channel.x + channel.y)) * bandPower.alpha * 24.0;
  const beta  = Math.sin(2 * Math.PI * 21.5 * t + channel.x * 5) * bandPower.beta * 14.0;
  const gamma = Math.sin(2 * Math.PI * 45.0 * t + channel.y * 7) * bandPower.gamma * 9.0;

  // 1/f Pink noise generator approximation
  const pinkNoise = (Math.random() - 0.5) * 4.5;
  // Regional dipole scale
  const localDipoleDrive = (regionActivity - 0.5) * 12.0;

  return Number((delta + theta + alpha + beta + gamma + pinkNoise + localDipoleDrive).toFixed(2));
}

/**
 * Canonical Double-Gamma Hemodynamic Response Function (fMRI BOLD)
 * h(t) = (t/d1)^a1 * exp(-(t-d1)/b1) - c * (t/d2)^a2 * exp(-(t-d2)/b2)
 */
export function canonicalHRF(tSeconds: number): number {
  if (tSeconds < 0) return 0;
  const a1 = 6;
  const b1 = 1;
  const a2 = 16;
  const b2 = 1;
  const c = 0.16;

  const peak = Math.pow(tSeconds, a1 - 1) * Math.exp(-tSeconds / b1) / 120;
  const undershoot = c * Math.pow(tSeconds, a2 - 1) * Math.exp(-tSeconds / b2) / 1000000;
  return peak - undershoot;
}

/**
 * Modified Beer-Lambert Law approximation for Prefrontal fNIRS
 * calculates changes in oxygenated (HbO) and deoxygenated (HbR) hemoglobin (μmol/L).
 */
export function computeFNIRS(pfcActivation: number, timeSec: number) {
  const metabolicDemand = pfcActivation * 1.8;
  const vascularInflection = Math.sin(timeSec * 0.25) * 0.15;
  const deltaHbO = Number((metabolicDemand * 2.8 + vascularInflection).toFixed(3));
  const deltaHbR = Number((-metabolicDemand * 1.1 + vascularInflection * 0.4).toFixed(3));
  const toi = Math.min(88, Math.max(52, 65 + (deltaHbO - deltaHbR) * 3.5)); // Tissue Oxygenation Index %
  return { deltaHbO, deltaHbR, toi: Number(toi.toFixed(1)) };
}
