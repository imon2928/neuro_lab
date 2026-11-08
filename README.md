# SynapseLab 3D

A Django-hosted website for **SynapseLab 3D**, an interactive 3D neuroscience simulation built with React and Three.js (originally prototyped in AI Studio).

The simulation runs entirely in the browser. Django's role is to serve the page and static files, handle security settings, and make deployment straightforward. The compiled frontend is already included in `lab/static/lab/`, so **Node.js is not required just to run the project**.

## Features

- Interactive 3D simulation running client-side (React + TypeScript + Three.js)
- Django backend serving the page, static assets, and security headers
- WhiteNoise for static file serving (no separate nginx static config needed)
- Health check endpoint at `/healthz/`
- Ready for deployment on Render (`render.yaml` and `build.sh` included), Railway, Fly.io, or behind nginx/Caddy
- Reference PDFs bundled in `lab/static/lab/docs/`

## Quick Start

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env               # Windows: copy .env.example .env

# 4. Run the development server
python manage.py runserver
```

Then open <http://127.0.0.1:8000/> in your browser.

## Project Structure

```
neuro_lab/
├── manage.py
├── requirements.txt
├── build.sh                 # Build script for deployment
├── render.yaml              # Render deployment config
├── .env.example             # Sample environment variables
├── config/                  # Django settings, urls, wsgi/asgi
├── lab/                     # Django app (views, urls, templates)
│   ├── templates/lab/index.html   # Page that loads the React app
│   └── static/lab/                # Compiled app.js, index.css
│       └── docs/                  # Reference PDFs
└── frontend/                # Original React/TypeScript source
```

## Modifying the Frontend

Only needed if you want to change the simulation or UI. Requires **Node.js 20+**.

```bash
cd frontend
npm install
npm run build        # Outputs to ../lab/static/lab/
```

For live editing, run `npm run dev` (serves on port 3000).

## Production Deployment

Set these environment variables in `.env` or on your server:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<a long random string>
DJANGO_ALLOWED_HOSTS=yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

Then collect static files and start Gunicorn:

```bash
python manage.py collectstatic --noinput
gunicorn config.wsgi --bind 0.0.0.0:8000
```

Notes:

- To test without HTTPS, set `DJANGO_SSL_REDIRECT=False`.
- Use `/healthz/` as the health check URL on your hosting platform.

## Customization

| What to change                     | Where                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Site title and description         | `SITE` in `lab/views.py`                                               |
| Simulation, presets, UI            | `frontend/src/`                                                        |
| Timezone                           | `TIME_ZONE` in `config/settings.py`                                    |
| New pages (e.g. About)             | `lab/urls.py` + `lab/views.py` + a new template                        |
| Database (users, saving results)   | `DATABASES` is currently empty; add SQLite/PostgreSQL in `config/settings.py` |

## Testing

```bash
python manage.py test
```

## License

No license has been specified yet. Consider adding one (e.g. MIT) if you want others to use or contribute to this project.
