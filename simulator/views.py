import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .neuro_engine import run_advanced_simulation

def home_view(request):
    """হোমপেজ রেন্ডার করে প্রিসেট ও প্রাথমিক ডাটা সহ"""
    default_payload = {
        'circuits': {
            'mesolimbic': 80,
            'visual': 85,
            'cerebellar': 40,
            'cen': 30,
            'dmn': 30,
            'stress_axis': 50
        },
        'multipliers': {
            'dopamine': 1.40,
            'glutamate': 1.20,
            'gaba': 0.80,
            'norepi': 1.10,
            'serotonin': 0.80,
            'ach': 0.60
        },
        'duration_minutes': 120,
        'current_minute': 98
    }
    initial_data = run_advanced_simulation(default_payload)
    return render(request, 'simulator/index.html', {'initial': initial_data})

@csrf_exempt
def simulate_experiment_api(request):
    """ফ্রন্টএন্ডের যেকোনো পরিবর্তন থেকে লাইভ রেজাল্ট প্রদান করে"""
    if request.method == 'POST':
        try:
            payload = json.loads(request.body)
            result = run_advanced_simulation(payload)
            return JsonResponse({'status': 'success', 'data': result})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)