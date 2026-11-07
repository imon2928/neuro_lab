"""
simulator/engine/config.py

Global biophysical constants, integration timesteps, channel orders,
and engine metadata for model versioning and audit trails.
"""
from dataclasses import dataclass
from typing import List, Tuple


@dataclass(frozen=True)
class EngineConfig:
    MODEL_VERSION: str = "3.2.0-validatable"
    INTEGRATOR_DT: float = 0.005  # 5 ms numerical integration step
    DEFAULT_DURATION_MINUTES: int = 20
    RANDOM_SEED: int = 42

    # Canonical 14 Structures
    CANONICAL_REGIONS: Tuple[str, ...] = (
        "frontal", "parietal", "temporal", "occipital", "cerebrum",
        "thalamus", "hypothalamus", "pituitary", "hippocampus",
        "amygdala", "midbrain", "pons", "medulla", "cerebellum"
    )

    # 13 Standard 10-20 EEG Channels
    EEG_CHANNELS: Tuple[str, ...] = (
        "Fp1", "Fp2", "F3", "F4", "C3", "Cz", "C4",
        "T3", "T4", "P3", "P4", "O1", "O2"
    )

    # 6 Standard Neuromodulators
    NEUROCHEMICALS: Tuple[str, ...] = (
        "dopamine", "glutamate", "gaba", "norepi", "serotonin", "ach"
    )

    # Wilson-Cowan Default Biophysical Parameters
    TAU_E: float = 0.016   # Excitatory time constant (seconds)
    TAU_I: float = 0.024   # Inhibitory time constant (seconds)
    W_EE: float = 12.0     # Local E -> E recurrent excitation
    W_IE: float = 15.0     # Local I -> E feedback inhibition
    W_EI: float = 10.0     # Local E -> I feedforward excitation
    W_II: float = 3.0      # Local I -> I recurrent inhibition

    # Canonical Hemodynamic Response Function (HRF) parameters (Glover / SPM double-gamma)
    HRF_A1: float = 6.0    # Peak delay (seconds)
    HRF_B1: float = 0.9    # Peak dispersion
    HRF_A2: float = 16.0   # Undershoot delay (seconds)
    HRF_B2: float = 0.9    # Undershoot dispersion
    HRF_C: float = 0.35    # Ratio of peak to undershoot

    # Monte Carlo Sample Count for Uncertainty Bands
    MONTE_CARLO_RUNS: int = 15