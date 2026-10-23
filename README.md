# SynapseLab 3D — Django প্রজেক্ট

AI Studio-র SynapseLab 3D (React + Three.js) অ্যাপটাকে Django ওয়েবসাইট হিসেবে সাজানো হয়েছে।
সিমুলেশন পুরোটাই ব্রাউজারে চলে, তাই Django এখানে পেজ, static ফাইল, security আর deployment সামলায়।
কম্পাইল করা ফ্রন্টএন্ড `lab/static/lab/` এ আছে, চালাতে Node.js লাগবে না।

## লোকাল রান

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env
python manage.py runserver
```

ব্রাউজারে খোলো: http://127.0.0.1:8000/

## প্রজেক্ট স্ট্রাকচার

```
manage.py
config/            settings, urls, wsgi/asgi
lab/               Django app (view, urls, template)
  templates/lab/index.html   React অ্যাপ লোড করার পেজ
  static/lab/                কম্পাইল করা app.js, index.css
  static/lab/docs/           রেফারেন্স PDF
frontend/          মূল React/TypeScript সোর্স (এডিট করতে চাইলে)
```

## ফ্রন্টএন্ড কোড বদলালে (Node.js 20+ লাগবে)

```bash
cd frontend
npm install
npm run build        # আউটপুট যায় ../lab/static/lab/ এ
```

লাইভ এডিটের জন্য `npm run dev` (port 3000) ব্যবহার করতে পারো।

## Production deploy

`.env` বা সার্ভারের environment এ সেট করো:

```
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<লম্বা random string>
DJANGO_ALLOWED_HOSTS=yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

```bash
python manage.py collectstatic --noinput
gunicorn config.wsgi --bind 0.0.0.0:8000
```

WhiteNoise static ফাইল সার্ভ করে, আলাদা nginx static কনফিগ লাগবে না। reverse proxy (nginx/Caddy) বা Render, Railway, Fly.io এর পেছনে চালানো যাবে। HTTPS ছাড়া টেস্ট করতে `DJANGO_SSL_REDIRECT=False` দাও।
Health check URL: `/healthz/`

## কাস্টমাইজ করার জায়গা

| কী বদলাবে | কোথায় |
|---|---|
| সাইটের টাইটেল ও description | `lab/views.py` এর `SITE` |
| সিমুলেশন, প্রিসেট, UI | `frontend/src/` |
| টাইমজোন | `config/settings.py` এর `TIME_ZONE` |
| নতুন পেজ (যেমন About) | `lab/urls.py` + `lab/views.py` + নতুন template |
| ডাটাবেস (ইউজার, রেজাল্ট সেভ) | `DATABASES` এখন খালি। লাগলে `config/settings.py` এ SQLite/PostgreSQL যোগ করো |

## টেস্ট

```bash
python manage.py test
```
