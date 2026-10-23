from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

SITE = {
    "title": "SynapseLab 3D - Virtual Neuroscience & Neural Circuit Laboratory",
    "description": (
        "Interactive 3D biophysical brain simulation with anatomical structures, "
        "neurotransmitter dynamics, realistic neural circuits, multi-channel EEG, "
        "fMRI BOLD, and cognitive experiment testing."
    ),
}


@require_GET
def index(request):
    return render(request, "lab/index.html", {"site": SITE})


@require_GET
def healthz(request):
    return JsonResponse({"status": "ok"})
