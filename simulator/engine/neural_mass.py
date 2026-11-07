"""
simulator/engine/neural_mass.py

Vectorized Wilson-Cowan neural mass model across 14 coupled brain regions.
Grounded in the Stanford Digital Brain multiscale philosophy:
Direct neurochemical-to-circuit modulation, physiological E/I balance,
and heterogeneous regional specialization.
"""
import json
import logging
from pathlib import Path
import numpy as np
from typing import Dict, Any, Tuple
from .config import EngineConfig

logger = logging.getLogger(__name__)


class WilsonCowanNetwork:
    def __init__(self, connectivity_path: Path = None):
        if connectivity_path is None:
            base_dir = Path(__file__).resolve().parent.parent.parent
            connectivity_path = base_dir / "data" / "structural_connectivity.json"

        self.connectivity_path = connectivity_path
        self.c_matrix, self.is_placeholder = self._load_connectivity()

    def _load_connectivity(self) -> Tuple[np.ndarray, bool]:
        n = len(EngineConfig.CANONICAL_REGIONS)
        if not self.connectivity_path.exists():
            return np.eye(n) * 0.1, True
        try:
            with open(self.connectivity_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                matrix = np.array(data.get("matrix", []), dtype=np.float64)
                if matrix.shape != (n, n):
                    return np.eye(n) * 0.1, True
                return matrix, data.get("is_placeholder", True)
        except Exception as exc:
            logger.exception("Failed to parse structural connectivity: %s", exc)
            return np.eye(n) * 0.1, True

    @staticmethod
    def _sigmoid(x: np.ndarray, theta: np.ndarray, gain: np.ndarray) -> np.ndarray:
        """Nonlinear sigmoidal response function."""
        z = np.clip(gain * (x - theta), -6.0, 6.0)
        return 1.0 / (1.0 + np.exp(-z))

    def simulate(
        self,
        gains: Dict[str, Dict[str, float]],
        circuit_inputs: Dict[str, float],
        neurochemicals: Dict[str, float],
        duration_sec: float = 1.0,
        dt: float = EngineConfig.INTEGRATOR_DT,
        noise_seed: int = None
    ) -> Dict[str, Any]:
        """
        Integrates the 14-region coupled Wilson-Cowan model.
        Every region directly couples circuit weights with neurochemical multipliers.
        """
        rng = np.random.default_rng(noise_seed if noise_seed is not None else EngineConfig.RANDOM_SEED)

        regions = list(EngineConfig.CANONICAL_REGIONS)
        n_regions = len(regions)
        steps = int(duration_sec / dt)

        # 1. Unpack Raw Neurochemical Multipliers (0.2x to 3.0x)
        m_da   = float(neurochemicals.get("dopamine", 1.35))
        m_glu  = float(neurochemicals.get("glutamate", 1.30))
        m_gaba = float(neurochemicals.get("gaba", 0.85))
        m_ne   = float(neurochemicals.get("norepi", 1.10))
        m_ser  = float(neurochemicals.get("serotonin", 0.85))
        m_ach  = float(neurochemicals.get("ach", 0.90))

        # 2. Normalized Circuit Inputs (0.0 to 1.0)
        c_meso   = float(circuit_inputs.get("mesolimbic", 50.0)) / 100.0
        c_vis    = float(circuit_inputs.get("visual", 50.0)) / 100.0
        c_cere   = float(circuit_inputs.get("cerebellar", 50.0)) / 100.0
        c_cen    = float(circuit_inputs.get("cen", 50.0)) / 100.0
        c_dmn    = float(circuit_inputs.get("dmn", 50.0)) / 100.0
        c_stress = float(circuit_inputs.get("stress_axis", 50.0)) / 100.0

        # 3. Direct Biological Region-Specific Causal Drive
        # Reflecting receptor distribution and anatomical projections
        reg_drive = np.zeros(n_regions, dtype=np.float64)
        for idx, r in enumerate(regions):
            if r == "frontal":
                # Prefrontal cortex: CEN + Dopamine (D1) + ACh + Glutamate - GABA
                reg_drive[idx] = (c_cen * 0.50 + 0.20) * m_da * m_ach * m_glu - (m_gaba * 0.25)
            elif r == "parietal":
                # Posterior parietal: CEN + Visual integration + Glutamate
                reg_drive[idx] = (c_cen * 0.35 + c_vis * 0.35 + 0.15) * m_glu * m_ach - (m_gaba * 0.20)
            elif r == "temporal":
                # Temporal lobe: DMN + Auditory/Language + Serotonin modulation
                reg_drive[idx] = (c_dmn * 0.50 + 0.25) * m_ach * m_glu * (1.1 - m_ne * 0.2)
            elif r == "occipital":
                # Primary visual cortex (V1): Retino-geniculo-striate + Glutamate
                reg_drive[idx] = (c_vis * 0.85 + 0.15) * m_glu * (1.0 if m_gaba < 1.2 else 0.85)
            elif r == "cerebrum":
                # Global cortical integration
                reg_drive[idx] = (c_cen * 0.35 + c_vis * 0.35 + c_dmn * 0.30) * m_glu
            elif r == "thalamus":
                # Sensory gating relay: Glutamate + NE - GABA gating
                reg_drive[idx] = (c_vis * 0.40 + c_cere * 0.30 + 0.20) * (m_glu * 0.6 + m_ne * 0.4) - (m_gaba * 0.20)
            elif r == "hypothalamus":
                # HPA autonomic stress axis: Stress axis + Norepinephrine - Serotonin
                reg_drive[idx] = (c_stress * 0.80 + 0.15) * m_ne * 1.15 - (m_ser * 0.30)
            elif r == "pituitary":
                # Endocrine cascade following hypothalamus
                reg_drive[idx] = (c_stress * 0.70 + 0.15) * m_ne
            elif r == "hippocampus":
                # Memory consolidation: ACh + CEN - High Stress penalty
                stress_penalty = 0.25 if m_ne > 1.3 else 0.0
                reg_drive[idx] = (c_cen * 0.40 + c_dmn * 0.30 + 0.20) * m_ach * m_glu - stress_penalty
            elif r == "amygdala":
                # Salience/Threat detection: NE + Stress - Serotonin - GABA
                reg_drive[idx] = (c_stress * 0.85 + 0.15) * m_ne * m_glu - (m_ser * 0.35 + m_gaba * 0.30)
            elif r == "midbrain":
                # VTA / SNc: Mesolimbic Dopaminergic Core
                reg_drive[idx] = (c_meso * 0.80 + 0.20) * m_da * m_glu
            elif r == "pons":
                # Brainstem relay & motor gating: ACh + NE
                reg_drive[idx] = (c_cere * 0.50 + 0.20) * m_ach * m_ne
            elif r == "medulla":
                # Autonomic cardiorespiratory center: NE drive
                reg_drive[idx] = (c_stress * 0.55 + 0.30) * m_ne
            elif r == "cerebellum":
                # Motor timing loop: Cerebellar loop + ACh - GABA
                reg_drive[idx] = (c_cere * 0.85 + 0.15) * m_ach * m_glu - (m_gaba * 0.20)

        # Normalize and keep in robust physiological dynamic range
        reg_drive = np.clip(reg_drive, 0.15, 1.45)

        # 4. Wilson-Cowan Coupling Parameters
        w_ee = 8.5
        w_ie = 6.2 * m_gaba  # GABA directly scales local microcircuit feedback inhibition
        w_ei = 7.0 * m_glu   # Glutamate directly scales feedforward excitation
        w_ii = 2.0

        ext_p = 0.25 + reg_drive * 1.10
        ext_q = 0.15 + m_gaba * 0.35

        gain_e = np.array([gains[r]["gain_e"] for r in regions], dtype=np.float64) * m_glu
        gain_i = np.array([gains[r]["gain_i"] for r in regions], dtype=np.float64) * m_gaba
        th_e = np.array([gains[r]["threshold_e"] for r in regions], dtype=np.float64)
        th_i = np.array([gains[r]["threshold_i"] for r in regions], dtype=np.float64)

        # State initialization
        E = np.clip(reg_drive * 0.55, 0.15, 0.85)
        I = np.clip(reg_drive * 0.40 * m_gaba, 0.10, 0.80)

        time_series_e = np.zeros((steps, n_regions), dtype=np.float64)

        # 5. Numerical Integration (Euler-Maruyama)
        for s in range(steps):
            coupling_e = (self.c_matrix @ E) * 0.12
            noise_e = rng.normal(0, 0.03, size=n_regions)

            in_e = w_ee * E - w_ie * I + coupling_e + ext_p + noise_e
            in_i = w_ei * E - w_ii * I + ext_q

            dE = (-E + self._sigmoid(in_e, th_e, gain_e)) / EngineConfig.TAU_E
            dI = (-I + self._sigmoid(in_i, th_i, gain_i)) / EngineConfig.TAU_I

            E += dE * dt
            I += dI * dt

            E = np.clip(E, 0.05, 0.95)
            I = np.clip(I, 0.05, 0.95)

            time_series_e[s, :] = E

        # 6. Compute Individualized Regional Activations (%) & E/I Balance
        mean_e = np.mean(time_series_e[-int(0.4 / dt):, :], axis=0)
        mean_i = I

        activations = {}
        for idx, r in enumerate(regions):
            # Dynamic activation percentage [15% to 95%]
            pct = float(np.round(np.clip(
                (reg_drive[idx] * 0.60 + mean_e[idx] * 0.40) * 85.0,
                15.0, 95.0
            ), 1))

            ei = float(np.round((mean_e[idx] * 1.35) / (mean_i[idx] + 0.05), 2))

            activations[r] = {
                "activation_pct": pct,
                "e_rate": float(np.round(mean_e[idx], 4)),
                "i_rate": float(np.round(mean_i[idx], 4)),
                "ei_ratio": ei,
                "time_series": time_series_e[:, idx].tolist()
            }

        return {
            "regions": activations,
            "raw_e_matrix": time_series_e,
            "time_axis": (np.arange(steps) * dt).tolist()
        }