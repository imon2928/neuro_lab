from django.test import SimpleTestCase
from django.urls import reverse


class LabTests(SimpleTestCase):
    def test_index_serves_react_mount_point(self):
        r = self.client.get(reverse("lab:index"))
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, '<div id="root"></div>')
        self.assertContains(r, "lab/app.js")

    def test_healthz(self):
        r = self.client.get(reverse("lab:healthz"))
        self.assertEqual(r.json(), {"status": "ok"})
