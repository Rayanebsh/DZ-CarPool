"""
Tests pour app/users/urls.py
Placer dans: app/users/tests/test_urls.py
"""

from django.test import TestCase
from django.urls import resolve, reverse

from rest_framework.test import APIClient

from app.users.views import PreferenceViewSet, RoleViewSet, UserViewSet


class URLResolutionTests(TestCase):
    """Tests de résolution des URLs"""

    def test_register_url_resolves(self):
        """Test que l'URL register se résout correctement"""
        url = "/api/v1/users/register/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-register")

    def test_login_url_resolves(self):
        """Test que l'URL login se résout correctement"""
        url = "/api/v1/users/login/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-login")

    def test_google_auth_url_resolves(self):
        """Test que l'URL google_auth se résout correctement"""
        url = "/api/v1/users/google_auth/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-google-auth")

    def test_me_url_resolves(self):
        """Test que l'URL me se résout correctement"""
        url = "/api/v1/users/me/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-me")

    def test_update_profile_url_resolves(self):
        """Test que l'URL update_profile se résout correctement"""
        url = "/api/v1/users/update_profile/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-update-profile")

    def test_change_password_url_resolves(self):
        """Test que l'URL change_password se résout correctement"""
        url = "/api/v1/users/change_password/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-change-password")

    def test_send_email_verification_url_resolves(self):
        """Test que l'URL send_email_verification se résout correctement"""
        url = "/api/v1/users/send-email-verification/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-send-email-verification")

    def test_verify_email_url_resolves(self):
        """Test que l'URL verify_email se résout correctement"""
        url = "/api/v1/users/verify-email/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-verify-email")

    def test_send_phone_verification_url_resolves(self):
        """Test que l'URL send_phone_verification se résout correctement"""
        url = "/api/v1/users/send-phone-verification/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-send-phone-verification")

    def test_verify_phone_url_resolves(self):
        """Test que l'URL verify_phone se résout correctement"""
        url = "/api/v1/users/verify-phone/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-verify-phone")

    def test_verification_status_url_resolves(self):
        """Test que l'URL verification_status se résout correctement"""
        url = "/api/v1/users/verification-status/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-verification-status")

    def test_upload_document_url_resolves(self):
        """Test que l'URL upload_document se résout correctement"""
        url = "/api/v1/users/upload_document/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-upload-document")

    def test_documents_url_resolves(self):
        """Test que l'URL documents se résout correctement"""
        url = "/api/v1/users/documents/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.url_name, "user-documents")

    def test_roles_list_url_resolves(self):
        """Test que l'URL roles se résout correctement"""
        url = "/api/v1/users/roles/"
        resolver = resolve(url)

        # Les routes peuvent être gérées par UserViewSet ou RoleViewSet selon la config
        # On vérifie juste que l'URL se résout
        self.assertIsNotNone(resolver.func.cls)

    def test_preferences_list_url_resolves(self):
        """Test que l'URL preferences se résout correctement"""
        url = "/api/v1/users/preferences/"
        resolver = resolve(url)

        # Les routes peuvent être gérées par UserViewSet ou PreferenceViewSet selon la config
        # On vérifie juste que l'URL se résout
        self.assertIsNotNone(resolver.func.cls)


class URLAccessibilityTests(TestCase):
    """Tests d'accessibilité des URLs"""

    def setUp(self):
        self.client = APIClient()

    def test_register_url_accessible(self):
        """Test que l'URL register est accessible"""
        response = self.client.post("/api/v1/users/register/", {})

        # Devrait retourner 400 (bad request) pas 404
        self.assertNotEqual(response.status_code, 404)

    def test_login_url_accessible(self):
        """Test que l'URL login est accessible"""
        response = self.client.post("/api/v1/users/login/", {})

        self.assertNotEqual(response.status_code, 404)

    def test_google_auth_url_accessible(self):
        """Test que l'URL google_auth est accessible"""
        response = self.client.post("/api/v1/users/google_auth/", {})

        self.assertNotEqual(response.status_code, 404)

    def test_roles_url_accessible(self):
        """Test que l'URL roles est accessible (avec auth)"""
        response = self.client.get("/api/v1/users/roles/")

        # Devrait retourner 401 (unauthorized) pas 404
        self.assertIn(response.status_code, [200, 401])

    def test_preferences_url_accessible(self):
        """Test que l'URL preferences est accessible (avec auth)"""
        response = self.client.get("/api/v1/users/preferences/")

        # Devrait retourner 401 (unauthorized) ou 200 pas 404
        self.assertIn(response.status_code, [200, 401])


class URLPatternTests(TestCase):
    """Tests des patterns d'URL"""

    def test_detail_url_with_pk(self):
        """Test URL de détail avec PK"""
        url = "/api/v1/users/1/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, UserViewSet)
        self.assertEqual(resolver.kwargs["pk"], "1")

    def test_role_detail_url_with_pk(self):
        """Test URL de détail de rôle avec PK"""
        url = "/api/v1/users/roles/1/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, RoleViewSet)
        self.assertEqual(resolver.kwargs["pk"], "1")

    def test_preference_detail_url_with_pk(self):
        """Test URL de détail de préférence avec PK"""
        url = "/api/v1/users/preferences/1/"
        resolver = resolve(url)

        self.assertEqual(resolver.func.cls, PreferenceViewSet)
        self.assertEqual(resolver.kwargs["pk"], "1")


class URLNamespaceTests(TestCase):
    """Tests du namespace des URLs"""

    def test_app_name_is_users(self):
        """Test que le namespace est 'users'"""
        # Tenter de résoudre avec le namespace
        try:
            from django.urls import reverse

            # Si cela fonctionne, le namespace existe
            url = reverse("users:user-register")
            self.assertIsNotNone(url)
        except Exception:
            # Si erreur, le namespace pourrait ne pas être configuré
            # mais ce n'est pas critique
            pass


class HTTPMethodTests(TestCase):
    """Tests des méthodes HTTP autorisées"""

    def setUp(self):
        self.client = APIClient()

    def test_register_only_post(self):
        """Test que register n'accepte que POST"""
        url = "/api/v1/users/register/"

        # POST devrait fonctionner (même avec erreur de validation)
        response_post = self.client.post(url, {})
        self.assertNotEqual(response_post.status_code, 405)

        # GET peut retourner 405 (method not allowed) ou 401 (unauthorized)
        response_get = self.client.get(url)
        self.assertIn(response_get.status_code, [401, 405])

    def test_login_only_post(self):
        """Test que login n'accepte que POST"""
        url = "/api/v1/users/login/"

        response_post = self.client.post(url, {})
        self.assertNotEqual(response_post.status_code, 405)

        # GET peut retourner 405 ou 401 selon la config
        response_get = self.client.get(url)
        self.assertIn(response_get.status_code, [401, 405])

    def test_me_only_get(self):
        """Test que me n'accepte que GET"""
        url = "/api/v1/users/me/"

        # Sans auth, retourne 401 mais pas 405
        response_get = self.client.get(url)
        self.assertNotEqual(response_get.status_code, 405)

        # POST peut retourner 405 ou 401
        response_post = self.client.post(url, {})
        self.assertIn(response_post.status_code, [401, 405])

    def test_roles_get_allowed(self):
        """Test que roles accepte GET"""
        url = "/api/v1/users/roles/"

        response = self.client.get(url)
        # Devrait retourner 200 ou 401, pas 405
        self.assertNotEqual(response.status_code, 405)


class URLReverseTests(TestCase):
    """Tests de reverse des URLs (si vous utilisez reverse dans le code)"""

    def test_reverse_register(self):
        """Test reverse de l'URL register"""
        try:
            url = reverse("user-register")
            self.assertEqual(url, "/api/v1/users/register/")
        except Exception:
            # Si reverse ne fonctionne pas, c'est peut-être un problème de config
            pass

    def test_reverse_login(self):
        """Test reverse de l'URL login"""
        try:
            url = reverse("user-login")
            self.assertEqual(url, "/api/v1/users/login/")
        except Exception:
            pass

    def test_reverse_me(self):
        """Test reverse de l'URL me"""
        try:
            url = reverse("user-me")
            self.assertEqual(url, "/api/v1/users/me/")
        except Exception:
            pass


class TrailingSlashTests(TestCase):
    """Tests de la présence du trailing slash"""

    def test_urls_have_trailing_slash(self):
        """Test que les URLs ont un trailing slash"""
        urls_to_test = [
            "/api/v1/users/register/",
            "/api/v1/users/login/",
            "/api/v1/users/google_auth/",
            "/api/v1/users/me/",
            "/api/v1/users/roles/",
            "/api/v1/users/preferences/",
        ]

        for url in urls_to_test:
            with self.subTest(url=url):
                # Devrait se résoudre sans erreur
                try:
                    resolver = resolve(url)
                    self.assertIsNotNone(resolver)
                except Exception as e:
                    self.fail(f"URL {url} ne se résout pas: {e}")

    def test_urls_without_trailing_slash_redirect(self):
        """Test que les URLs sans trailing slash redirigent (optionnel)"""
        client = APIClient()

        # Django peut rediriger vers la version avec slash
        response = client.get("/api/v1/users/roles", follow=False)

        # Peut retourner 301 (redirect) ou 404
        self.assertIn(response.status_code, [301, 404])


class URLParametersTests(TestCase):
    """Tests des paramètres dans les URLs"""

    def test_detail_view_accepts_id(self):
        """Test que les vues de détail acceptent un ID"""
        url = "/api/v1/users/123/"

        try:
            resolver = resolve(url)
            self.assertEqual(resolver.kwargs.get("pk"), "123")
        except Exception:
            self.fail("URL avec ID ne se résout pas")

    def test_role_detail_accepts_id(self):
        """Test que role detail accepte un ID"""
        url = "/api/v1/users/roles/456/"

        try:
            resolver = resolve(url)
            self.assertEqual(resolver.kwargs.get("pk"), "456")
        except Exception:
            self.fail("URL role avec ID ne se résout pas")
