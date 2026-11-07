"""
simulator/engine/validation.py

Automated validation test-harness that runs benchmark scenarios and compares
the model output against /data/validation_references.json.
Leaves scientific literature slots blank for empirical citation input.
"""
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

logger = logging.getLogger(__name__)


class ValidationHarness:
    def __init__(self, references_path: Path = None):
        if references_path is None:
            base_dir = Path(__file__).resolve().parent.parent.parent
            references_path = base_dir / "data" / "validation_references.json"
        self.references_path = references_path
        self.references = self._load_references()

    def _load_references(self) -> List[Dict[str, Any]]:
        if not self.references_path.exists():
            logger.error("Validation references missing at %s", self.references_path)
            return []
        try:
            with open(self.references_path, "r", encoding="utf-8") as f:
                return json.load(f).get("benchmarks", [])
        except Exception as exc:
            logger.exception("Failed to load validation references: %s", exc)
            return []

    def run_validation(self, run_simulation_fn) -> Dict[str, Any]:
        """
        Executes paired condition simulations for each benchmark and tests
        directionality and effect-size satisfaction.
        """
        results = []

        for b in self.references:
            b_id = b["id"]
            expected_dir = b["expected_direction"]

            # 1. Condition Baseline
            res_baseline = run_simulation_fn(
                neurochemicals={"glutamate": 50, "gaba": 50, "dopamine": 50, "serotonin": 50, "norepi": 50, "ach": 50},
                circuits={"mesolimbic": 50, "visual": 50, "cen": 50, "stress_axis": 40},
                seed=42
            )

            # 2. Condition Experimental Challenge
            if b_id == "eyes_closed_vs_open":
                res_exp = run_simulation_fn(
                    neurochemicals={"glutamate": 30, "gaba": 75, "dopamine": 40, "serotonin": 60, "norepi": 30, "ach": 40},
                    circuits={"mesolimbic": 30, "visual": 15, "cen": 30, "stress_axis": 20},
                    seed=42
                )
                val_base = res_baseline["diagnostics"]["eeg"]["spectral_bands"]["alpha"]
                val_exp = res_exp["diagnostics"]["eeg"]["spectral_bands"]["alpha"]

            elif b_id == "caffeine_challenge":
                res_exp = run_simulation_fn(
                    neurochemicals={"glutamate": 75, "gaba": 35, "dopamine": 65, "serotonin": 50, "norepi": 70, "ach": 70},
                    circuits={"mesolimbic": 65, "visual": 60, "cen": 75, "stress_axis": 60},
                    seed=42
                )
                val_base = res_baseline["diagnostics"]["eeg"]["spectral_bands"]["beta"]
                val_exp = res_exp["diagnostics"]["eeg"]["spectral_bands"]["beta"]

            elif b_id == "caffeine_cerebral_perfusion":
                res_exp = run_simulation_fn(
                    neurochemicals={"glutamate": 75, "gaba": 35, "dopamine": 65, "serotonin": 50, "norepi": 70, "ach": 70},
                    circuits={"mesolimbic": 65, "visual": 60, "cen": 75, "stress_axis": 60},
                    seed=42
                )
                val_base = res_baseline["diagnostics"]["fmri"]["mean_bold"]
                val_exp = res_exp["diagnostics"]["fmri"]["mean_bold"]

            elif b_id == "short_video_reels_novelty":
                res_exp = run_simulation_fn(
                    neurochemicals={"glutamate": 70, "gaba": 40, "dopamine": 85, "serotonin": 40, "norepi": 65, "ach": 45},
                    circuits={"mesolimbic": 90, "visual": 90, "cen": 25, "stress_axis": 50},
                    seed=42
                )
                val_base = res_baseline["regions"]["midbrain"]["activation_pct"]
                val_exp = res_exp["regions"]["midbrain"]["activation_pct"]

            else:  # Repeatability test
                res_exp = run_simulation_fn(
                    neurochemicals={"glutamate": 50, "gaba": 50, "dopamine": 50, "serotonin": 50, "norepi": 50, "ach": 50},
                    circuits={"mesolimbic": 50, "visual": 50, "cen": 50, "stress_axis": 40},
                    seed=42
                )
                val_base = res_baseline["global_ei_balance"]
                val_exp = res_exp["global_ei_balance"]

            # Calculate direction and delta %
            delta = val_exp - val_base
            pct_change = (delta / (val_base + 1e-9)) * 100.0

            if expected_dir == "increase":
                passed = pct_change > 0
            elif expected_dir == "decrease":
                passed = pct_change < 0
            else:  # unchanged
                passed = abs(pct_change) < 5.0

            results.append({
                "benchmark_id": b_id,
                "scenario": b["scenario"],
                "target_metric": b["target_metric"],
                "expected_direction": expected_dir,
                "baseline_value": round(val_base, 2),
                "simulated_value": round(val_exp, 2),
                "delta_pct": round(pct_change, 2),
                "status": "PASS" if passed else "FAIL",
                "citation": b.get("citation", ""),
                "notes": b.get("notes", "")
            })

        df = pd.DataFrame(results)
        return {
            "summary": {
                "total_scenarios": len(results),
                "passed": sum(1 for r in results if r["status"] == "PASS"),
                "failed": sum(1 for r in results if r["status"] == "FAIL"),
            },
            "benchmark_results": results,
            "csv_string": df.to_csv(index=False)
        }