"""
Tests pour les modèles (bonus)
Placer dans: app/users/tests/test_models.py
"""

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from app.users.models import EmailVerification, PhoneVerification, User


class UserModelTests(TestCase):
    """Tests pour le modèle User"""

    def test_create_user(self):
        """Test création d'un utilisateur"""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            last_name="Doe",
        )

        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """Test création d'un superutilisateur"""
        user = User.objects.create_superuser(
            email="admin@example.com", password="adminpass123"
        )

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)

    def test_user_string_representation(self):
        """Test représentation string de l'utilisateur"""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

        self.assertEqual(str(user), "test@example.com")

    def test_email_normalized(self):
        """Test normalisation de l'email"""
        user = User.objects.create_user(
            email="Test@EXAMPLE.com", password="testpass123"
        )

        self.assertEqual(user.email, "Test@example.com")

    def test_user_without_email_raises_error(self):
        """Test création utilisateur sans email"""
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="testpass123")


class EmailVerificationModelTests(TestCase):
    """Tests pour le modèle EmailVerification"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

    def test_create_verification(self):
        """Test création d'une vérification email"""
        verification = EmailVerification.objects.create(user=self.user)

        self.assertEqual(verification.user, self.user)
        self.assertEqual(len(verification.code), 6)
        self.assertFalse(verification.is_verified)
        self.assertEqual(verification.attempts, 0)

    def test_verification_code_format(self):
        """Test format du code de vérification"""
        verification = EmailVerification.objects.create(user=self.user)

        self.assertTrue(verification.code.isdigit())
        self.assertEqual(len(verification.code), 6)

    def test_verification_expires_at(self):
        """Test date d'expiration"""
        verification = EmailVerification.objects.create(user=self.user)

        # Le code devrait expirer dans environ 30 minutes
        time_diff = verification.expires_at - timezone.now()
        self.assertAlmostEqual(
            time_diff.total_seconds(), 30 * 60, delta=10  # 30 minutes avec marge de 10s
        )

    def test_is_valid_method(self):
        """Test méthode is_valid"""
        verification = EmailVerification.objects.create(user=self.user)

        # Code valide au départ
        self.assertTrue(verification.is_valid())

        # Code invalide après expiration
        verification.expires_at = timezone.now() - timedelta(minutes=1)
        verification.save()
        self.assertFalse(verification.is_valid())

        # Code invalide après trop de tentatives
        verification.expires_at = timezone.now() + timedelta(minutes=30)
        verification.attempts = 3
        verification.save()
        self.assertFalse(verification.is_valid())

        # Code invalide si déjà vérifié
        verification.attempts = 0
        verification.is_verified = True
        verification.save()
        self.assertFalse(verification.is_valid())

    def test_string_representation(self):
        """Test représentation string"""
        verification = EmailVerification.objects.create(user=self.user)

        # Adapter selon votre méthode __str__ dans models.py
        expected = f"Email verification for {self.user.email}"
        self.assertEqual(str(verification), expected)


class PhoneVerificationModelTests(TestCase):
    """Tests pour le modèle PhoneVerification"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            phone_number="+213555123456",
        )

    def test_create_verification(self):
        """Test création d'une vérification téléphone"""
        verification = PhoneVerification.objects.create(user=self.user)

        self.assertEqual(verification.user, self.user)
        self.assertEqual(len(verification.code), 6)
        self.assertFalse(verification.is_verified)
        self.assertEqual(verification.attempts, 0)

    def test_verification_code_format(self):
        """Test format du code SMS"""
        verification = PhoneVerification.objects.create(user=self.user)

        self.assertTrue(verification.code.isdigit())
        self.assertEqual(len(verification.code), 6)

    def test_is_valid_method(self):
        """Test méthode is_valid"""
        verification = PhoneVerification.objects.create(user=self.user)

        self.assertTrue(verification.is_valid())

        # Code expiré
        verification.expires_at = timezone.now() - timedelta(minutes=1)
        verification.save()
        self.assertFalse(verification.is_valid())

    def test_string_representation(self):
        """Test représentation string"""
        verification = PhoneVerification.objects.create(user=self.user)

        # Adapter selon votre méthode __str__ dans models.py
        expected = f"Phone verification for {self.user.phone_number}"
        self.assertEqual(str(verification), expected)

    def test_multiple_verifications_per_user(self):
        """Test plusieurs vérifications pour un utilisateur"""
        verification1 = PhoneVerification.objects.create(user=self.user)
        verification2 = PhoneVerification.objects.create(user=self.user)

        self.assertNotEqual(verification1.code, verification2.code)
        self.assertEqual(PhoneVerification.objects.filter(user=self.user).count(), 2)


class VerificationModelIntegrationTests(TestCase):
    """Tests d'intégration pour les modèles de vérification"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            phone_number="+213555123456",
        )

    def test_user_can_have_both_verifications(self):
        """Test qu'un utilisateur peut avoir email et SMS"""
        # ✅ CORRECTION : Créer les vérifications avant de les compter
        email_verification = EmailVerification.objects.create(user=self.user)
        phone_verification = PhoneVerification.objects.create(user=self.user)

        # Maintenant on peut vérifier qu'elles existent
        self.assertEqual(EmailVerification.objects.filter(user=self.user).count(), 1)
        self.assertEqual(PhoneVerification.objects.filter(user=self.user).count(), 1)

        # Vérifier que ce sont les bonnes instances
        self.assertEqual(email_verification.user, self.user)
        self.assertEqual(phone_verification.user, self.user)

    def test_verification_cascade_delete(self):
        """Test suppression en cascade"""
        EmailVerification.objects.create(user=self.user)
        PhoneVerification.objects.create(user=self.user)

        user_id = self.user.id
        self.user.delete()

        # Les vérifications devraient être supprimées
        self.assertEqual(EmailVerification.objects.filter(user_id=user_id).count(), 0)
        self.assertEqual(PhoneVerification.objects.filter(user_id=user_id).count(), 0)
