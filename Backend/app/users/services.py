"""
app/users/services.py - Services pour l'envoi d'emails et SMS
Créer ce fichier dans app/users/
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class EmailService:
    """Service pour l'envoi d'emails"""

    @staticmethod
    def send_verification_code(user, code):
        """
        Envoie un email avec le code de vérification
        En mode dev, le code est affiché dans la console
        """
        subject = "Vérification de votre email - DZ-CarPool"

        html_message = (
            f"<html>"
            f"<body style='font-family: Arial, sans-serif; padding: 20px;'>"
            f"<div style='max-width: 600px; margin: 0 auto;'>"
            f"<h2 style='color: #FF5722;'>Bienvenue sur DZ-CarPool!</h2>"
            f"<p>Bonjour {user.first_name or user.email},</p>"
            f"<p>Merci de vous être inscrit sur DZ-CarPool. Voici votre code de vérification:</p>"
            f"<div style='background-color: #f5f5f5; padding: 20px; "
            f"text-align: center; margin: 20px 0;'>"
            f"<h1 style='color: #FF5722; margin: 0; font-size: 36px; letter-spacing: 10px;'>"
            f"{code}</h1></div>"
            f"<p>Ce code est valide pendant 30 minutes.</p>"
            f"<p style='color: #666; font-size: 12px;'>"
            f"Si vous n'avez pas créé de compte, ignorez cet email."
            f"</p></div></body></html>"
        )

        # Message texte
        text_message = f"""
        Bienvenue sur DZ-CarPool!
        Bonjour {user.first_name or user.email},
        Voici votre code de vérification: {code}
        Ce code est valide pendant 30 minutes.
        """
        try:
            if settings.DEBUG:
                logger.info(
                    f"""
                ════════════════════════════════════════
                📧 EMAIL DE VÉRIFICATION
                ════════════════════════════════════════
                À: {user.email}
                Nom: {user.first_name} {user.last_name}
                Code: {code}
                ════════════════════════════════════════
                """
                )

            # Envoyer l'email
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Erreur envoi email: {e}")
            return False


class SMSService:
    """Service pour l'envoi de SMS (simulation)"""

    @staticmethod
    def send_verification_code(user, code):
        """
        Envoie un SMS avec le code de vérification
        En mode dev, le code est affiché dans la console
        """
        message = (
            f"DZ-CarPool: Votre code de vérification est {code}. Valide 30 minutes."
        )

        try:
            # En mode développement, afficher dans la console
            if settings.DEBUG:
                logger.info(
                    f"""
                ════════════════════════════════════════
                📱 SMS DE VÉRIFICATION
                ════════════════════════════════════════
                À: {user.phone_number}
                Nom: {user.first_name} {user.last_name}
                Code: {code}
                Message: {message}
                ════════════════════════════════════════
                """
                )

            # TODO: Intégration future avec un provider SMS (Twilio, etc.)
            # Pour l'instant, on simule l'envoi

            return True
        except Exception as e:
            logger.error(f"Erreur envoi SMS: {e}")
            return False
