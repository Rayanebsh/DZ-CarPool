"""
app/users/services.py - Services pour l'envoi d'emails et SMS
VERSION CORRIGÉE avec gestion d'erreurs améliorée
"""

import logging
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger(__name__)


class EmailService:
    """Service pour l'envoi d'emails"""

    @staticmethod
    def _send_email(to_email, subject, text_content, html_content):
        """
        Méthode interne pour envoyer un email
        Retourne True si succès, False sinon
        """
        try:
            # En mode DEBUG, afficher dans la console
            if settings.DEBUG:
                logger.info(f"""
════════════════════════════════════════
📧 EMAIL ENVOYÉ
════════════════════════════════════════
À: {to_email}
Sujet: {subject}
════════════════════════════════════════
""")
            
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"✅ Email envoyé avec succès à {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email à {to_email}: {str(e)}")
            logger.exception(e)  # Log le traceback complet
            
            # En développement, on peut lever l'exception
            if settings.DEBUG:
                raise
            
            return False

    @staticmethod
    def send_verification_code(user, code):
        """
        Envoie un email avec le code de vérification
        """
        subject = "Vérification de votre email - DZ-CarPool"
        
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #FF5722;">Bienvenue sur DZ-CarPool!</h1>
                <p>Bonjour {user.first_name or user.email},</p>
                <p>Merci de vous être inscrit sur DZ-CarPool. Voici votre code de vérification:</p>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h2 style="color: #FF5722; font-size: 32px; margin: 0;">{code}</h2>
                </div>
                <p>Ce code est valide pendant 30 minutes.</p>
                <p style="color: #666; font-size: 14px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
            </div>
        </body>
        </html>
        """
        
        text_message = f"""
Bienvenue sur DZ-CarPool!

Bonjour {user.first_name or user.email},

Voici votre code de vérification: {code}

Ce code est valide pendant 30 minutes.
        """
        
        return EmailService._send_email(
            user.email, 
            subject, 
            text_message, 
            html_message
        )

    @staticmethod
    def send_password_reset_email(user, reset_url):
        """
        Envoie un email avec le lien de réinitialisation
        """
        subject = "Réinitialisation de votre mot de passe - DZ-CarPool"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 8px;">
                    <h1 style="color: #FF5722; text-align: center;">DZ-CarPool</h1>
                    <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
                    
                    <p>Bonjour {user.first_name or user.email},</p>
                    
                    <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte DZ-CarPool.</p>
                    
                    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                           style="display: inline-block; padding: 15px 30px; background-color: #FF5722; 
                                  color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Réinitialiser mon mot de passe
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        Ou copiez-collez ce lien dans votre navigateur :<br>
                        <a href="{reset_url}" style="color: #FF5722; word-break: break-all;">{reset_url}</a>
                    </p>
                    
                    <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #FF5722; margin: 20px 0;">
                        <p style="margin: 0; color: #e65100;">
                            <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure.
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                        Votre mot de passe restera inchangé.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2024 DZ-CarPool. Tous droits réservés.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Réinitialisation de votre mot de passe - DZ-CarPool

Bonjour {user.first_name or user.email},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte DZ-CarPool.

Cliquez sur ce lien pour créer un nouveau mot de passe :
{reset_url}

Ce lien est valide pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe DZ-CarPool
        """
        
        return EmailService._send_email(
            user.email,
            subject,
            text_content,
            html_content
        )

    @staticmethod
    def send_password_changed_confirmation(user):
        """
        Envoie un email de confirmation après changement de mot de passe
        """
        subject = "Votre mot de passe a été modifié - DZ-CarPool"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 8px;">
                    <h1 style="color: #FF5722; text-align: center;">DZ-CarPool</h1>
                    <h2 style="color: #4CAF50;">✅ Mot de passe modifié avec succès</h2>
                    
                    <p>Bonjour {user.first_name or user.email},</p>
                    
                    <p>Votre mot de passe DZ-CarPool a été modifié avec succès.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;">
                            <strong>Date et heure :</strong> {timezone.now().strftime('%d/%m/%Y à %H:%M')}
                        </p>
                    </div>
                    
                    <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #FF5722; margin: 20px 0;">
                        <p style="margin: 0; color: #e65100;">
                            <strong>⚠️ Vous n'êtes pas à l'origine de ce changement ?</strong><br>
                            Contactez-nous immédiatement à <a href="mailto:support@dz-carpool.com">support@dz-carpool.com</a>
                        </p>
                    </div>
                    
                    <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/login" 
                           style="display: inline-block; padding: 15px 30px; background-color: #FF5722; 
                                  color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Se connecter
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2024 DZ-CarPool. Tous droits réservés.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Mot de passe modifié - DZ-CarPool

Bonjour {user.first_name or user.email},

Votre mot de passe DZ-CarPool a été modifié avec succès.

Date et heure : {timezone.now().strftime('%d/%m/%Y à %H:%M')}

Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.

Cordialement,
L'équipe DZ-CarPool
        """
        
        return EmailService._send_email(
            user.email,
            subject,
            text_content,
            html_content
        )


class SMSService:
    """Service pour l'envoi de SMS (simulation)"""

    @staticmethod
    def send_verification_code(user, code):
        """
        Envoie un SMS avec le code de vérification
        En mode dev, le code est affiché dans la console
        """
        message = f"DZ-CarPool: Votre code de vérification est {code}. Valide 30 minutes."

        try:
            if settings.DEBUG:
                logger.info(f"""
════════════════════════════════════════
📱 SMS DE VÉRIFICATION
════════════════════════════════════════
À: {user.phone_number}
Nom: {user.first_name} {user.last_name}
Code: {code}
Message: {message}
════════════════════════════════════════
""")

            # TODO: Intégration future avec un provider SMS (Twilio, etc.)
            return True

        except Exception as e:
            logger.error(f"❌ Erreur envoi SMS: {str(e)}")
            return False