"""
simulator/neuro_engine.py

Central Orchestration Pipeline linking:
Receptor Atlas -> Wilson-Cowan Neural Mass -> Multimodal Diagnostic Physics Forward Models.
"""
import numpy as np
from typing import Dict, Any

from .engine.config import EngineConfig
from .engine.mapping import ReceptorAtlasMapper
from .engine.neural_mass import WilsonCowanNetwork
from .engine.forward_models import ForwardDiagnosticSuite
from .engine.state import CentralBrainState, NeurochemicalEntry, RegionState, DiagnosticSignals

_mapper = ReceptorAtlasMapper()
_network = WilsonCowanNetwork()
_forward = ForwardDiagnosticSuite()


def run_advanced_simulation(payload: Dict[str, Any], seed: int = EngineConfig.RANDOM_SEED) -> Dict[str, Any]:
    circuits_in = payload.get("circuits", {})
    multipliers_in = payload.get("multipliers", {})
    paradigm = payload.get("paradigm", "cognitive")
    cur_t = float(payload.get("current_minute", 0))
    total_t = max(1.0, float(payload.get("duration_minutes", 20)))

    # Raw neurochemical multipliers (0.2x to 3.0x)
    nt_levels = {
        "dopamine": float(multipliers_in.get("dopamine", 1.35)),
        "glutamate": float(multipliers_in.get("glutamate", 1.30)),
        "gaba": float(multipliers_in.get("gaba", 0.85)),
        "norepi": float(multipliers_in.get("norepi", 1.10)),
        "serotonin": float(multipliers_in.get("serotonin", 0.85)),
        "ach": float(multipliers_in.get("ach", 0.90)),
    }

    # 1. Compute Receptor Atlas Gains
    gains = _mapper.compute_region_gains(nt_levels)

    # 2. Simulate Coupled Wilson-Cowan Neural Mass with Direct Transmitter Driving
    sim_res = _network.simulate(
        gains=gains,
        circuit_inputs=circuits_in,
        neurochemicals=nt_levels,
        duration_sec=1.0,
        dt=EngineConfig.INTEGRATOR_DT,
        noise_seed=seed
    )

    regional_act = sim_res["regions"]
    time_series_matrix = sim_res["raw_e_matrix"]

    # 3. Physics Forward Models Directly Linked to Central Regional States
    fs = 1.0 / EngineConfig.INTEGRATOR_DT
    eeg_out = _forward.compute_eeg(time_series_matrix, sampling_rate=fs, regional_act=regional_act)
    fmri_out = _forward.compute_fmri(regional_act)
    fnirs_out = _forward.compute_fnirs(regional_act["frontal"]["activation_pct"])
    mean_brain_act = float(np.mean([regional_act[r]["activation_pct"] for r in regional_act]))
    meg_out = _forward.compute_meg(time_series_matrix, mean_activity=mean_brain_act)

    # PET scan directly grounded in Dopamine, Midbrain/Striatal metabolism, and Glucose uptake
    striatal_act = regional_act["midbrain"]["activation_pct"]
    suv_val = float(round(3.5 + (striatal_act * 0.05) + (nt_levels["dopamine"] * 1.4), 1))
    d2_bpnd = float(round(3.2 / max(0.2, nt_levels["dopamine"] * 1.1), 2))
    cmr_glu = float(round(28.0 + (regional_act["cerebrum"]["activation_pct"] * 0.28), 1))
    
    pet_out = {
        "radiotracer": "18F-FDG & 11C-Raclopride",
        "mean_striatal_suv": suv_val,
        "d2_bpnd": d2_bpnd,
        "cmr_glu": cmr_glu
    }

    smri_out = {
        "field_strength": "3.0 Tesla",
        "sequences": "3D T1-MPRAGE & T2-FLAIR",
        "isotropic_voxel_mm": 1.0,
        "snr_db": 32.4
    }

    ei_ratios = [regional_act[r]["ei_ratio"] for r in regional_act]
    mean_ei = float(round(float(np.mean(ei_ratios)), 2)) if len(ei_ratios) > 0 else 1.0
    progress = min(1.0, cur_t / total_t)
    fatigue = max(0.45, float(round(1.05 - progress * 0.50, 2)))

    state = CentralBrainState(
        is_placeholder_data=_mapper.is_placeholder or _network.is_placeholder,
        data_quality_label="PLACEHOLDER DATA" if (_mapper.is_placeholder or _network.is_placeholder) else "LITERATURE-CALIBRATED",
        neurochemicals={
            k: NeurochemicalEntry(level=nt_levels[k] * 50.0, active=True, source="unified")
            for k in nt_levels
        },
        circuits=circuits_in,
        timeline={
            "current_minute": cur_t,
            "duration_minutes": total_t,
            "phase_name": "Sustained Cognitive Engagement" if progress < 0.5 else "Synaptic Exhaustion / Downregulation",
            "fatigue_factor": fatigue,
            "paradigm": paradigm
        },
        regions={
            r: RegionState(
                activation_pct=regional_act[r]["activation_pct"],
                excitatory_rate=regional_act[r]["e_rate"],
                inhibitory_rate=regional_act[r]["i_rate"],
                ei_ratio=regional_act[r]["ei_ratio"],
                metabolic_demand=float(round(regional_act[r]["activation_pct"] * 0.052, 2))
            )
            for r in regional_act
        },
        global_ei_balance=mean_ei,
        diagnostics=DiagnosticSignals(
            eeg=eeg_out,
            meg=meg_out,
            fmri=fmri_out,
            fnirs=fnirs_out,
            pet=pet_out,
            smri=smri_out
        )
    )

    return state.to_dict()