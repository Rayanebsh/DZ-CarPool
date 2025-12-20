from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    """Classe d'authentification JWT personnalisée (extension minimale).

    Hérite de `JWTAuthentication` de `rest_framework_simplejwt`.
    On peut étendre/override ses méthodes si nécessaire.
    """

    pass
