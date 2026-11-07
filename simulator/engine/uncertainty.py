"""
simulator/engine/uncertainty.py

Monte Carlo parameter perturbation over input noise and biophysical gains.
Yields 95% Confidence Intervals for downstream diagnostics and sets provenance badge.
"""
import numpy as np
from typing import Dict, Any, List
from .config import EngineConfig


class MonteCarloEstimator:
    @staticmethod
    def estimate_intervals(
        base_simulation_fn,
        neurochemicals: Dict[str, float],
        circuits: Dict[str, float],
        runs: int = EngineConfig.MONTE_CARLO_RUNS,
        noise_level: float = 0.05
    ) -> Dict[str, Any]:
        """
        Performs N Monte Carlo passes with perturbed inputs to establish confidence bounds.
        """
        rng = np.random.default_rng(EngineConfig.RANDOM_SEED)
        sampled_ei = []
        sampled_bold = []
        sampled_alpha = []

        for i in range(runs):
            # Perturb neurochemical levels slightly
            perturbed_nt = {
                k: float(np.clip(v + rng.normal(0, noise_level * 10), 0.0, 100.0))
                for k, v in neurochemicals.items()
            }
            res = base_simulation_fn(perturbed_nt, circuits, seed=int(1000 + i))
            sampled_ei.append(res["global_ei_balance"])
            sampled_bold.append(res["diagnostics"]["fmri"]["mean_bold"])
            sampled_alpha.append(res["diagnostics"]["eeg"]["spectral_bands"]["alpha"])

        def get_ci95(arr: List[float]) -> Dict[str, float]:
            a = np.array(arr)
            return {
                "mean": float(np.round(np.mean(a), 2)),
                "ci_lower": float(np.round(np.percentile(a, 2.5), 2)),
                "ci_upper": float(np.round(np.percentile(a, 97.5), 2))
            }

        return {
            "global_ei_ci95": get_ci95(sampled_ei),
            "fmri_mean_bold_ci95": get_ci95(sampled_bold),
            "eeg_alpha_pct_ci95": get_ci95(sampled_alpha),
            "monte_carlo_samples": runs
        }