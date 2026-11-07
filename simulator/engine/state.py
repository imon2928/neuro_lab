"""
simulator/engine/state.py

The Single Central State Object (CentralBrainState).
Every downstream test and visualizer strictly derives its signals from this state.
No test is allowed to maintain private numbers.
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List
from .config import EngineConfig


@dataclass
class NeurochemicalEntry:
    level: float        # Normalized 0.0 - 100.0%
    active: bool        # On / Off toggle
    source: str         # 'manual' | 'webcam_task' | 'preset'


@dataclass
class RegionState:
    activation_pct: float     # 0.0 - 100.0%
    excitatory_rate: float    # Wilson-Cowan E population firing rate
    inhibitory_rate: float    # Wilson-Cowan I population firing rate
    ei_ratio: float           # Local E/I balance ratio
    metabolic_demand: float   # Derived glucose / oxygen consumption rate


@dataclass
class DiagnosticSignals:
    eeg: Dict[str, Any]
    meg: Dict[str, Any]
    fmri: Dict[str, Any]
    fnirs: Dict[str, Any]
    pet: Dict[str, Any]
    smri: Dict[str, Any]


@dataclass
class CentralBrainState:
    model_version: str = EngineConfig.MODEL_VERSION
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    random_seed: int = EngineConfig.RANDOM_SEED
    is_placeholder_data: bool = True
    data_quality_label: str = "PLACEHOLDER / UNCALIBRATED"

    # 1. Inputs
    neurochemicals: Dict[str, NeurochemicalEntry] = field(default_factory=dict)
    circuits: Dict[str, float] = field(default_factory=dict)
    timeline: Dict[str, Any] = field(default_factory=dict)

    # 2. Regional Neural-Mass Dynamics
    regions: Dict[str, RegionState] = field(default_factory=dict)
    global_ei_balance: float = 1.0

    # 3. Physics-Forward Derived Outputs
    diagnostics: DiagnosticSignals = field(default_factory=lambda: DiagnosticSignals({}, {}, {}, {}, {}, {}))

    # 4. Uncertainty Intervals (+- 95% Confidence Bounds)
    uncertainty: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert entire hierarchy into serializable dictionary."""
        return asdict(self)