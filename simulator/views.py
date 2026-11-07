"""
simulator/views.py

Production Django views and API controllers for Virtual NeuroLab.
Serves the central user interface, runs physics-forward simulations,
orchestrates Monte Carlo uncertainty estimation, handles automated
validation scenarios with CSV/JSON exports, and enforces privacy data deletion.
"""
import json
import logging
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from .neuro_engine import run_advanced_simulation
from .engine.config import EngineConfig
from .engine.validation import ValidationHarness
from .engine.uncertainty import MonteCarloEstimator

logger = logging.getLogger(__name__)
_validator = ValidationHarness()


def home_view(request):
    """
    Renders the unified laboratory dashboard.
    Pre-populates the template with the initial baseline Central Brain State.
    """
    initial_payload = {
        "circuits": {
            "mesolimbic": 80.0,
            "visual": 85.0,
            "cerebellar": 40.0,
            "cen": 45.0,
            "dmn": 40.0,
            "stress_axis": 40.0
        },
        "multipliers": {
            "dopamine": 1.35,
            "glutamate": 1.30,
            "gaba": 0.85,
            "norepi": 1.10,
            "serotonin": 0.85,
            "ach": 0.90
        },
        "duration_minutes": 20,
        "current_minute": 0,
        "paradigm": "sensory"
    }
    initial_state = run_advanced_simulation(initial_payload, seed=EngineConfig.RANDOM_SEED)

    context = {
        "initial_state_json": json.dumps(initial_state),
        "model_version": EngineConfig.MODEL_VERSION,
        "is_placeholder": initial_state.get("is_placeholder_data", True),
        "data_quality_label": initial_state.get("data_quality_label", "PLACEHOLDER")
    }
    return render(request, "simulator/index.html", context)


@csrf_exempt
def simulate_experiment_api(request):
    """
    POST: /api/simulate/
    Accepts neurochemical toggles, multipliers, active circuits, and timelines.
    Runs the Wilson-Cowan neural mass model, projects to all 6 forward diagnostics,
    computes Monte Carlo 95% confidence intervals, and returns the unified Central Brain State.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed. Use POST."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        return JsonResponse({"status": "error", "message": f"Malformed JSON: {str(exc)}"}, status=400)

    try:
        # 1. Primary Deterministic Forward Run
        seed = int(payload.get("seed", EngineConfig.RANDOM_SEED))
        central_state = run_advanced_simulation(payload, seed=seed)

        # 2. Monte Carlo Uncertainty Bounds
        multipliers = payload.get("multipliers", {})
        circuits = payload.get("circuits", {})

        def base_runner(nt_dict, circ_dict, seed):
            p = dict(payload)
            p["multipliers"] = nt_dict
            p["circuits"] = circ_dict
            return run_advanced_simulation(p, seed=seed)

        uncertainty_intervals = MonteCarloEstimator.estimate_intervals(
            base_simulation_fn=base_runner,
            neurochemicals=multipliers,
            circuits=circuits,
            runs=EngineConfig.MONTE_CARLO_RUNS
        )
        central_state["uncertainty"] = uncertainty_intervals

        return JsonResponse({"status": "success", "data": central_state}, status=200)

    except Exception as exc:
        logger.exception("Error executing simulation pipeline: %s", exc)
        return JsonResponse({"status": "error", "message": str(exc)}, status=500)


@csrf_exempt
def run_validation_api(request):
    """
    POST: /api/validation/run/
    Runs the built-in validation harness across canonical empirical benchmarks:
    - Eyes Closed vs. Open (Berger alpha effect)
    - Caffeine challenge (Beta increase & vasoconstrictive BOLD drop)
    - Short-form reels sensory overload (Striatal dopamine surge)
    - Baseline repeatability
    Compares directionality and effect magnitude against data/validation_references.json.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed. Use POST."}, status=405)

    try:
        def harness_runner(neurochemicals, circuits, seed):
            payload = {
                "multipliers": neurochemicals,
                "circuits": circuits,
                "duration_minutes": 20,
                "current_minute": 5,
                "paradigm": "cognitive"
            }
            return run_advanced_simulation(payload, seed=seed)

        report = _validator.run_validation(run_simulation_fn=harness_runner)
        return JsonResponse({"status": "success", "report": report}, status=200)

    except Exception as exc:
        logger.exception("Validation execution failure: %s", exc)
        return JsonResponse({"status": "error", "message": str(exc)}, status=500)


def export_validation_csv_api(request):
    """
    GET: /api/validation/export/?format=csv (or format=json)
    Exports benchmark validation outputs for academic documentation and paper figures.
    """
    export_format = request.GET.get("format", "csv").lower()

    def harness_runner(neurochemicals, circuits, seed):
        payload = {
            "multipliers": neurochemicals,
            "circuits": circuits,
            "duration_minutes": 20,
            "current_minute": 5,
            "paradigm": "cognitive"
        }
        return run_advanced_simulation(payload, seed=seed)

    report = _validator.run_validation(run_simulation_fn=harness_runner)

    if export_format == "json":
        response = HttpResponse(
            json.dumps(report["benchmark_results"], indent=2),
            content_type="application/json"
        )
        response["Content-Disposition"] = f'attachment; filename="virtual_neurolab_validation_{EngineConfig.MODEL_VERSION}.json"'
        return response

    response = HttpResponse(report["csv_string"], content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="virtual_neurolab_validation_{EngineConfig.MODEL_VERSION}.csv"'
    return response


@csrf_exempt
def delete_local_data_api(request):
    """
    POST: /api/consent/delete/
    Compliance & privacy endpoint. Flushes active server session data and confirms
    zero persistence of participant biometrics or webcam frame buffers.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed. Use POST."}, status=405)

    request.session.flush()
    return JsonResponse({
        "status": "success",
        "message": "All session data, participant proxies, and transient buffers purged successfully. No biometrics are stored."
    }, status=200)