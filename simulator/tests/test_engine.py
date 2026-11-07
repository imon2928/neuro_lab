"""
simulator/tests/test_engine.py

Unit and integration tests for the Virtual NeuroLab simulation engine.
Tests HRF convolution, FFT spectral estimation, receptor mapping, and central state.
"""
from django.test import TestCase
import numpy as np
from simulator.engine.config import EngineConfig
from simulator.engine.state import CentralBrainState
from simulator.engine.mapping import ReceptorAtlasMapper
from simulator.engine.neural_mass import WilsonCowanNetwork
from simulator.engine.forward_models import ForwardDiagnosticSuite


class EngineUnitTests(TestCase):
    def setUp(self):
        self.mapper = ReceptorAtlasMapper()
        self.network = WilsonCowanNetwork()
        self.diagnostics = ForwardDiagnosticSuite()

    def test_hrf_convolution_properties(self):
        """Test canonical HRF integration sums to 1.0 and has delayed peak."""
        hrf = ForwardDiagnosticSuite.canonical_hrf(duration_sec=30.0, dt=0.5)
        self.assertEqual(len(hrf), 60)
        self.assertAlmostEqual(float(np.sum(hrf)), 1.0, places=4)
        peak_idx = int(np.argmax(hrf))
        peak_time_sec = peak_idx * 0.5
        # Canonical Glover peak occurs around 5 - 6 seconds
        self.assertTrue(4.5 <= peak_time_sec <= 7.0)

    def test_fft_spectral_band_normalization(self):
        """Verify EEG band power outputs sum to 100%."""
        fs = 200.0  # 200 Hz
        t = np.arange(0, 1.0, 1.0 / fs)
        # Synthetic alpha (10 Hz) signal across 14 regions
        synth_data = np.zeros((len(t), 14))
        synth_data[:, :] = np.sin(2 * np.pi * 10.0 * t)[:, None]

        eeg_res = self.diagnostics.compute_eeg(synth_data, sampling_rate=fs)
        bands = eeg_res["spectral_bands"]
        total_pct = sum(bands.values())
        self.assertTrue(98 <= total_pct <= 102)
        # Alpha should dominate
        self.assertGreater(bands["alpha"], bands["delta"])

    def test_receptor_atlas_schema_and_gain_bounds(self):
        """Verify gains remain physiologically bounded under extreme inputs."""
        extreme_nt = {
            "dopamine": 3.0, "glutamate": 3.0, "gaba": 0.1,
            "norepi": 3.0, "serotonin": 0.1, "ach": 3.0
        }
        gains = self.mapper.compute_region_gains(extreme_nt)
        self.assertEqual(len(gains), 14)
        for r, vals in gains.items():
            self.assertGreaterEqual(vals["gain_e"], 0.2)
            self.assertGreaterEqual(vals["gain_i"], 0.2)
            self.assertLessEqual(vals["gain_e"], 10.0)

    def test_central_brain_state_consistency(self):
        """Verify central state integrity and schema metadata."""
        state = CentralBrainState()
        state_dict = state.to_dict()
        self.assertEqual(state_dict["model_version"], EngineConfig.MODEL_VERSION)
        self.assertTrue(state_dict["is_placeholder_data"])
        self.assertIn("data_quality_label", state_dict)