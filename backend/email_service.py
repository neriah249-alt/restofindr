import os
import resend
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")

def send_reset_password_email(to_email: str, reset_link: str, name: str = ""):
    """Envoie un email via Resend"""
    
    print("=" * 60)
    print("📧 TENTATIVE D'ENVOI D'EMAIL (Resend)")
    print("=" * 60)
    print(f"📤 De: {FROM_EMAIL}")
    print(f"📥 À: {to_email}")
    print(f"🔗 Lien: {reset_link}")
    
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY non configuré")
        print("=" * 60)
        return False
    
    # Configurer Resend
    resend.api_key = RESEND_API_KEY
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f97316; }}
            .header h1 {{ color: #f97316; font-size: 28px; margin: 0; }}
            .content {{ padding: 30px 0; }}
            .button {{ display: inline-block; background: #f97316; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; }}
            .footer {{ text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍽️ RestoGo Bénin</h1>
            </div>
            <div class="content">
                <h2>Bonjour {name if name else 'cher utilisateur'} 👋</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le bouton ci-dessous :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" class="button">🔑 Réinitialiser mon mot de passe</a>
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    Ce lien est valable 24 heures.
                </p>
            </div>
            <div class="footer">
                <p>© 2024 RestoGo Bénin - Tous droits réservés</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        # Envoyer l'email
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "🔑 Réinitialisation de votre mot de passe - RestoGo Bénin",
            "html": html_content
        })
        
        print(f"✅ Email envoyé avec succès à {to_email}")
        print(f"📨 ID: {response}")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ Erreur d'envoi: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        return False