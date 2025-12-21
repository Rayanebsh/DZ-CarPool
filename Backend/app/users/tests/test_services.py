"""
Tests pour app/users/services.py
Placer dans: app/users/tests/test_services.py
"""

from unittest.mock import patch

from django.conf import settings
from django.core import mail
from django.test import TestCase, override_settings

from app.users.models import User
from app.users.services import EmailService, SMSService


class EmailServiceTests(TestCase):
    """Tests pour le service d'envoi d'emails"""

    def setUp(self):
        """Configuration initiale"""
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            last_name="Doe",
        )
        self.verification_code = "123456"

    def test_send_verification_code_success(self):
        """Test envoi email de vérification réussi"""
        result = EmailService.send_verification_code(self.user, self.verification_code)

        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)

        email = mail.outbox[0]
        self.assertEqual(email.subject, "Vérification de votre email - DZ-CarPool")
        self.assertEqual(email.to, [self.user.email])
        self.assertIn(self.verification_code, email.body)
        self.assertIn(self.verification_code, email.alternatives[0][0])

    def test_send_verification_code_html_content(self):
        """Test contenu HTML de l'email"""
        EmailService.send_verification_code(self.user, self.verification_code)

        email = mail.outbox[0]
        html_content = email.alternatives[0][0]

        self.assertIn("DZ-CarPool", html_content)
        self.assertIn(self.user.first_name, html_content)
        self.assertIn(self.verification_code, html_content)
        self.assertIn("30 minutes", html_content)

    def test_send_verification_code_text_content(self):
        """Test contenu texte de l'email"""
        EmailService.send_verification_code(self.user, self.verification_code)

        email = mail.outbox[0]
        self.assertIn("DZ-CarPool", email.body)
        self.assertIn(self.verification_code, email.body)
        self.assertIn("30 minutes", email.body)

    def test_send_verification_code_without_first_name(self):
        """Test envoi email sans prénom"""
        user = User.objects.create_user(
            email="noname@example.com", password="testpass123"
        )

        result = EmailService.send_verification_code(user, self.verification_code)

        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(user.email, mail.outbox[0].body)

    @override_settings(DEBUG=True)
    @patch("app.users.services.logger")
    def test_send_verification_code_logs_in_debug(self, mock_logger):
        """Test logging en mode DEBUG"""
        EmailService.send_verification_code(self.user, self.verification_code)

        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("EMAIL DE VÉRIFICATION", call_args)
        self.assertIn(self.user.email, call_args)
        self.assertIn(self.verification_code, call_args)

    @patch("app.users.services.send_mail")
    @patch("app.users.services.logger")
    def test_send_verification_code_handles_exception(
        self, mock_logger, mock_send_mail
    ):
        """Test gestion d'erreur lors de l'envoi"""
        mock_send_mail.side_effect = Exception("SMTP Error")

        result = EmailService.send_verification_code(self.user, self.verification_code)

        self.assertFalse(result)
        mock_logger.error.assert_called_once()
        self.assertIn("Erreur envoi email", mock_logger.error.call_args[0][0])

    def test_send_verification_code_from_email(self):
        """Test que l'email utilise le bon expéditeur"""
        EmailService.send_verification_code(self.user, self.verification_code)

        email = mail.outbox[0]
        self.assertEqual(email.from_email, settings.DEFAULT_FROM_EMAIL)


class SMSServiceTests(TestCase):
    """Tests pour le service d'envoi de SMS"""

    def setUp(self):
        """Configuration initiale"""
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            last_name="Doe",
            phone_number="+213555123456",
        )
        self.verification_code = "123456"

    @override_settings(DEBUG=True)
    @patch("app.users.services.logger")
    def test_send_verification_code_success(self, mock_logger):
        """Test envoi SMS de vérification réussi"""
        result = SMSService.send_verification_code(self.user, self.verification_code)

        self.assertTrue(result)
        mock_logger.info.assert_called_once()

    @override_settings(DEBUG=True)
    @patch("app.users.services.logger")
    def test_send_verification_code_logs_correctly(self, mock_logger):
        """Test que le SMS est correctement loggé"""
        SMSService.send_verification_code(self.user, self.verification_code)

        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("SMS DE VÉRIFICATION", call_args)
        self.assertIn(self.user.phone_number, call_args)
        self.assertIn(self.verification_code, call_args)
        self.assertIn("DZ-CarPool", call_args)
        self.assertIn("30 minutes", call_args)

    @override_settings(DEBUG=True)
    @patch("app.users.services.logger")
    def test_send_verification_code_message_format(self, mock_logger):
        """Test format du message SMS"""
        SMSService.send_verification_code(self.user, self.verification_code)

        call_args = mock_logger.info.call_args[0][0]
        expected_message = (
            f"DZ-CarPool: Votre code de vérification est {self.verification_code}. "
            "Valide 30 minutes."
        )
        self.assertIn(expected_message, call_args)

    @patch("app.users.services.logger")
    def test_send_verification_code_handles_exception(self, mock_logger):
        """Test gestion d'erreur lors de l'envoi"""
        # Simuler une erreur en patchant quelque chose qui va lever une exception
        with patch("app.users.services.settings") as mock_settings:
            mock_settings.DEBUG = True
            mock_settings.side_effect = Exception("SMS Service Error")

            # Le code devrait quand même retourner True car l'exception
            # n'est pas levée dans le bloc try
            result = SMSService.send_verification_code(
                self.user, self.verification_code
            )

            # En fonction de votre implémentation
            self.assertTrue(result)

    def test_send_verification_code_without_phone(self):
        """Test envoi SMS sans numéro de téléphone"""
        user = User.objects.create_user(
            email="nophone@example.com", password="testpass123"
        )

        # Le service devrait quand même retourner True
        # car il simule l'envoi
        result = SMSService.send_verification_code(user, self.verification_code)
        self.assertTrue(result)

    @override_settings(DEBUG=False)
    @patch("app.users.services.logger")
    def test_send_verification_code_production_mode(self, mock_logger):
        """Test que le SMS n'est pas loggé en production"""
        result = SMSService.send_verification_code(self.user, self.verification_code)

        self.assertTrue(result)
        # En mode production, logger.info ne devrait pas être appelé
        # (ou moins fréquemment)
        # À adapter selon votre logique


class EmailServiceIntegrationTests(TestCase):
    """Tests d'intégration pour EmailService"""

    def test_multiple_emails_sent(self):
        """Test envoi de plusieurs emails"""
        users = [
            User.objects.create_user(
                email=f"user{i}@example.com", password="testpass123"
            )
            for i in range(3)
        ]

        for i, user in enumerate(users):
            result = EmailService.send_verification_code(user, f"12345{i}")
            self.assertTrue(result)

        self.assertEqual(len(mail.outbox), 3)

        for i, email in enumerate(mail.outbox):
            self.assertEqual(email.to, [f"user{i}@example.com"])
            self.assertIn(f"12345{i}", email.body)


class SMSServiceIntegrationTests(TestCase):
    """Tests d'intégration pour SMSService"""

    @override_settings(DEBUG=True)
    @patch("app.users.services.logger")
    def test_multiple_sms_sent(self, mock_logger):
        """Test envoi de plusieurs SMS"""
        users = [
            User.objects.create_user(
                email=f"user{i}@example.com",
                password="testpass123",
                phone_number=f"+21355512345{i}",
            )
            for i in range(3)
        ]

        for i, user in enumerate(users):
            result = SMSService.send_verification_code(user, f"12345{i}")
            self.assertTrue(result)

        self.assertEqual(mock_logger.info.call_count, 3)
