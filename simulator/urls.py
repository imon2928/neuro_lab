"""
simulator/urls.py

Route configuration for Virtual NeuroLab.
Declares endpoints for simulation orchestration, validation testing,
scientific CSV export, and privacy compliance.
"""
from django.urls import path
from .views import (
    home_view,
    simulate_experiment_api,
    run_validation_api,
    export_validation_csv_api,
    delete_local_data_api
)

app_name = "simulator"

urlpatterns = [
    path("", home_view, name="home"),
    path("api/simulate/", simulate_experiment_api, name="simulate_api"),
    path("api/validation/run/", run_validation_api, name="run_validation_api"),
    path("api/validation/export/", export_validation_csv_api, name="export_validation_csv_api"),
    path("api/consent/delete/", delete_local_data_api, name="delete_local_data_api"),
]