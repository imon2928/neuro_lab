from django.urls import path
from .views import home_view, simulate_experiment_api

urlpatterns = [
    path('', home_view, name='home'),
    path('api/simulate/', simulate_experiment_api, name='simulate_experiment_api'),
]