#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install & Build React Frontend
cd frontend
npm install
npm run build
cd ..

# 2. Install Python Dependencies & Collectstatic
pip install -r requirements.txt
python manage.py collectstatic --no-input

# (MIGRATE LINE REMOVED HERE TO AVOID DB ENGINE ISSUE)