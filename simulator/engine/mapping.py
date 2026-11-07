"""
simulator/engine/mapping.py

Loads /data/receptor_atlas.json and computes transmitter-to-region
gain modulation vectors. Warns when placeholder data is loaded.
"""
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple
from .config import EngineConfig

logger = logging.getLogger(__name__)


class ReceptorAtlasMapper:
    def __init__(self, atlas_path: Path = None):
        if atlas_path is None:
            # Default lookup relative to Django project root
            base_dir = Path(__file__).resolve().parent.parent.parent
            atlas_path = base_dir / "data" / "receptor_atlas.json"

        self.atlas_path = atlas_path
        self.atlas_data = self._load_atlas()
        self.is_placeholder = self.atlas_data.get("is_placeholder", True)
        if self.is_placeholder:
            logger.warning(
                "[Virtual NeuroLab] NOTICE: receptor_atlas.json contains PLACEHOLDER data. "
                "Regional activations are model approximations. Run scripts/export_atlas.py to populate real maps."
            )

    def _load_atlas(self) -> Dict[str, Any]:
        if not self.atlas_path.exists():
            logger.error("Atlas file missing at %s. Initializing minimal fallback.", self.atlas_path)
            return {"is_placeholder": True, "regions": {}}
        try:
            with open(self.atlas_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:
            logger.exception("Failed to parse receptor atlas: %s", exc)
            return {"is_placeholder": True, "regions": {}}

    def compute_region_gains(self, neurochemicals: Dict[str, float]) -> Dict[str, Dict[str, float]]:
        """
        Calculates Excitatory Gain (G_E), Inhibitory Gain (G_I), and Threshold (Theta)
        for each canonical region based on its specific receptor density profile.
        """
        region_gains = {}
        regions_dict = self.atlas_data.get("regions", {})

        da = neurochemicals.get("dopamine", 1.0)
        glu = neurochemicals.get("glutamate", 1.0)
        gaba = neurochemicals.get("gaba", 1.0)
        ne = neurochemicals.get("norepi", 1.0)
        ser = neurochemicals.get("serotonin", 1.0)
        ach = neurochemicals.get("ach", 1.0)

        for region in EngineConfig.CANONICAL_REGIONS:
            reg_profile = regions_dict.get(region, {}).get("densities", {})

            d1 = reg_profile.get("D1", 0.5)
            d2 = reg_profile.get("D2", 0.5)
            nmda = reg_profile.get("NMDA", 0.7)
            gaba_a = reg_profile.get("GABA_A", 0.7)
            m1 = reg_profile.get("M1", 0.5)
            alpha2a = reg_profile.get("alpha2A", 0.5)
            ht1a = reg_profile.get("5HT1A", 0.5)

            # Excitatory gain modulation (increases with D1, NMDA, M1, and optimal NE)
            excitatory_drive = (
                (glu * nmda * 0.40) +
                (da * d1 * 0.25) +
                (ach * m1 * 0.20) +
                (ne * (1.0 - alpha2a * 0.5) * 0.15)
            )

            # Inhibitory gain modulation (scaled by GABA-A, 5HT1A, and presynaptic D2)
            inhibitory_drive = (
                (gaba * gaba_a * 0.50) +
                (ser * ht1a * 0.30) +
                (da * d2 * 0.20)
            )

            region_gains[region] = {
                "gain_e": max(0.2, excitatory_drive * 1.5),
                "gain_i": max(0.2, inhibitory_drive * 1.5),
                "threshold_e": max(0.1, 1.2 - excitatory_drive * 0.3),
                "threshold_i": max(0.1, 1.0 - inhibitory_drive * 0.2)
            }

        return region_gains