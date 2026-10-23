export interface BrainRegion {
  id: string;
  name: string;
  shortName: string;
  category: 'Cortical' | 'Subcortical' | 'Cerebellum' | 'Brainstem' | 'Limbic';
  function: string;
  transmitters: string[];
  baseFreq: number;
  position: [number, number, number];
  color: string;
  details: string;
}

export interface Neurotransmitter {
  id: string;
  name: string;
  formula: string;
  role: string;
  baseLevel: number; // nM
  color: string;
}

export interface CircuitPathway {
  id: string;
  name: string;
  description: string;
  nodes: string[]; // BrainRegion IDs
  color: string;
}

export const BRAIN_REGIONS: Record<string, BrainRegion> = {
  pfc: {
    id: 'pfc',
    name: 'Prefrontal Cortex (PFC)',
    shortName: 'PFC',
    category: 'Cortical',
    function: 'Executive decisions, focus, impulse control, working memory.',
    transmitters: ['Dopamine', 'Glutamate', 'GABA', 'Acetylcholine'],
    baseFreq: 18.5,
    position: [0, 0.8, 1.4],
    color: '#3b82f6',
    details: 'The dorsolateral and ventromedial prefrontal cortices orchestrate top-down cognitive control, planning, and emotional regulation.'
  },
  motor: {
    id: 'motor',
    name: 'Primary Motor Cortex (M1)',
    shortName: 'M1',
    category: 'Cortical',
    function: 'Voluntary movement planning and direct execution.',
    transmitters: ['Glutamate', 'GABA'],
    baseFreq: 21.0,
    position: [0, 1.5, 0.2],
    color: '#06b6d4',
    details: 'Executes neural impulses that control movement of muscle groups via corticospinal tracts.'
  },
  somatosensory: {
    id: 'somatosensory',
    name: 'Somatosensory Cortex (S1)',
    shortName: 'S1',
    category: 'Cortical',
    function: 'Processing tactile sensations, pain, temperature, and proprioception.',
    transmitters: ['Glutamate', 'GABA'],
    baseFreq: 19.0,
    position: [0, 1.5, -0.4],
    color: '#10b981',
    details: 'Receives tactile input from thalamic relay neurons forming the sensory homunculus map.'
  },
  parietal: {
    id: 'parietal',
    name: 'Parietal Lobe',
    shortName: 'Parietal',
    category: 'Cortical',
    function: 'Spatial awareness, sensory integration, and mathematical reasoning.',
    transmitters: ['Glutamate', 'GABA'],
    baseFreq: 16.0,
    position: [0, 1.2, -1.0],
    color: '#84cc16',
    details: 'Integrates somatosensory and visual streams to create a coherent 3D spatial model of the environment.'
  },
  occipital: {
    id: 'occipital',
    name: 'Occipital Cortex (V1-V4)',
    shortName: 'V1',
    category: 'Cortical',
    function: 'Primary visual processing, edge detection, motion, and color.',
    transmitters: ['Glutamate', 'GABA'],
    baseFreq: 11.2,
    position: [0, 0.2, -1.8],
    color: '#eab308',
    details: 'Transforms retinal lateral geniculate nucleus signals into complex visual perception scenes.'
  },
  temporal: {
    id: 'temporal',
    name: 'Temporal Cortex',
    shortName: 'Temporal',
    category: 'Cortical',
    function: 'Auditory processing, language comprehension (Wernicke), face recognition.',
    transmitters: ['Glutamate', 'GABA', 'Acetylcholine'],
    baseFreq: 14.5,
    position: [1.3, -0.1, 0.1],
    color: '#f97316',
    details: 'Contains primary auditory cortex and fusiform face area essential for sensory recognition.'
  },
  insular: {
    id: 'insular',
    name: 'Insular Cortex',
    shortName: 'Insular',
    category: 'Cortical',
    function: 'Interoception, pain perception, empathy, and visceral awareness.',
    transmitters: ['Glutamate', 'GABA', 'Serotonin'],
    baseFreq: 13.0,
    position: [0.8, 0.2, 0.3],
    color: '#f43f5e',
    details: 'Translates internal bodily visceral signals into emotional gut-feeling states.'
  },
  thalamus: {
    id: 'thalamus',
    name: 'Thalamus',
    shortName: 'Thalamus',
    category: 'Subcortical',
    function: 'Relay station for sensory/motor signals and consciousness gatekeeper.',
    transmitters: ['Glutamate', 'GABA'],
    baseFreq: 10.0,
    position: [0, 0.1, -0.1],
    color: '#a855f7',
    details: 'Acts as a central router filtering sensory information before cortical broadcasting.'
  },
  hypothalamus: {
    id: 'hypothalamus',
    name: 'Hypothalamus',
    shortName: 'HypoTH',
    category: 'Subcortical',
    function: 'Autonomic nervous control, neuroendocrine homeostasis, circadian rhythm.',
    transmitters: ['Norepinephrine', 'Serotonin', 'Dopamine'],
    baseFreq: 8.5,
    position: [0, -0.4, 0.2],
    color: '#ec4899',
    details: 'Master homeostatic regulator controlling pituitary hormone release and temperature/stress.'
  },
  hippocampus: {
    id: 'hippocampus',
    name: 'Hippocampus',
    shortName: 'Hippocampus',
    category: 'Limbic',
    function: 'Episodic memory consolidation and spatial navigation.',
    transmitters: ['Acetylcholine', 'Glutamate', 'GABA'],
    baseFreq: 7.0,
    position: [0.7, -0.3, -0.2],
    color: '#6366f1',
    details: 'Generates theta rhythms crucial for long-term potentiation (LTP) and memory encoding.'
  },
  amygdala: {
    id: 'amygdala',
    name: 'Amygdala',
    shortName: 'Amygdala',
    category: 'Limbic',
    function: 'Fear conditioning, emotional memory, threat detection.',
    transmitters: ['Norepinephrine', 'GABA', 'Serotonin'],
    baseFreq: 24.0,
    position: [0.9, -0.4, 0.4],
    color: '#ef4444',
    details: 'Triggers autonomic fight-or-flight responses upon threat detection.'
  },
  vta_nacc: {
    id: 'vta_nacc',
    name: 'VTA & Nucleus Accumbens',
    shortName: 'VTA/NAcc',
    category: 'Subcortical',
    function: 'Reward prediction, motivation, pleasure, and addiction loops.',
    transmitters: ['Dopamine', 'GABA', 'Glutamate'],
    baseFreq: 15.0,
    position: [0, -0.5, 0.3],
    color: '#14b8a6',
    details: 'Dopaminergic hub mediating reinforcement learning and motivational drive.'
  },
  cerebellum: {
    id: 'cerebellum',
    name: 'Cerebellum',
    shortName: 'Cerebellum',
    category: 'Cerebellum',
    function: 'Motor coordination, balance, fine tuning, and procedural memory.',
    transmitters: ['GABA', 'Glutamate'],
    baseFreq: 35.0,
    position: [0, -0.8, -1.3],
    color: '#8b5cf6',
    details: 'Contains Purkinje cell networks performing real-time motor error prediction.'
  },
  brainstem: {
    id: 'brainstem',
    name: 'Brainstem (Pons/Medulla)',
    shortName: 'Brainstem',
    category: 'Brainstem',
    function: 'Vital cardiac/respiratory regulation, alertness, neuromodulator nuclei.',
    transmitters: ['Serotonin', 'Norepinephrine', 'Acetylcholine'],
    baseFreq: 5.0,
    position: [0, -1.4, -0.6],
    color: '#64748b',
    details: 'Houses Locus Coeruleus and Raphe nuclei providing global arousal tone.'
  }
};