"""
apps/users/admin.py - Administration des utilisateurs
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Role, Preference, UserDocument, RefreshToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Administration personnalisée pour les utilisateurs"""
    
    list_display = [
        'email', 'full_name', 'phone_number', 'role', 
        'is_active', 'average_rating', 'total_trips', 'date_joined'
    ]
    list_filter = ['is_active', 'is_staff', 'role', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Informations de connexion', {
            'fields': ('email', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone_number', 'phone_verified', 
                      'profile_picture', 'bio')
        }),
        ('Rôle et préférences', {
            'fields': ('role', 'preferences')
        }),
        ('Statistiques', {
            'fields': ('trips_as_driver', 'trips_as_passenger', 'average_rating')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Dates importantes', {
            'fields': ('date_joined', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )
    
    readonly_fields = ['date_joined', 'updated_at', 'trips_as_driver', 
                      'trips_as_passenger', 'average_rating']
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Nom complet'
    
    def total_trips(self, obj):
        return obj.trips_as_driver + obj.trips_as_passenger
    total_trips.short_description = 'Trajets totaux'
    
    actions = ['activate_users', 'deactivate_users', 'verify_phone']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} utilisateur(s) activé(s)')
    activate_users.short_description = "Activer les utilisateurs sélectionnés"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} utilisateur(s) désactivé(s)')
    deactivate_users.short_description = "Désactiver les utilisateurs sélectionnés"
    
    def verify_phone(self, request, queryset):
        updated = queryset.update(phone_verified=True)
        self.message_user(request, f'{updated} téléphone(s) vérifié(s)')
    verify_phone.short_description = "Vérifier les téléphones"


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'user_count']
    search_fields = ['name']
    
    def user_count(self, obj):
        return obj.users.count()
    user_count.short_description = 'Nombre d\'utilisateurs'


@admin.register(Preference)
class PreferenceAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'user_count']
    search_fields = ['name']
    
    def user_count(self, obj):
        return obj.users.count()
    user_count.short_description = 'Nombre d\'utilisateurs'


@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'document_type', 'uploaded_at', 
        'verified_status', 'verified_by', 'verified_at'
    ]
    list_filter = ['document_type', 'verified', 'uploaded_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    date_hierarchy = 'uploaded_at'
    
    def verified_status(self, obj):
        if obj.verified:
            return format_html('<span style="color: green;">✓ Vérifié</span>')
        return format_html('<span style="color: red;">✗ Non vérifié</span>')
    verified_status.short_description = 'Statut'
    
    actions = ['verify_documents', 'reject_documents']
    
    def verify_documents(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            verified=True, 
            verified_by=request.user,
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} document(s) vérifié(s)')
    verify_documents.short_description = "Vérifier les documents"
    
    def reject_documents(self, request, queryset):
        updated = queryset.update(verified=False)
        self.message_user(request, f'{updated} document(s) rejeté(s)')
    reject_documents.short_description = "Rejeter les documents"


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'revoked', 'is_valid_display']
    list_filter = ['revoked', 'created_at', 'expires_at']
    search_fields = ['user__email']
    date_hierarchy = 'created_at'
    
    def is_valid_display(self, obj):
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Valide</span>')
        return format_html('<span style="color: red;">✗ Expiré/Révoqué</span>')
    is_valid_display.short_description = 'Validité'


# ============================================================================
# apps/trajets/admin.py - Administration des trajets
# ============================================================================

from django.contrib import admin
from app.trajets.models import Trajet, TrajetEtape, FuelPrice


@admin.register(Trajet)
class TrajetAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'route', 'conducteur', 'date', 'heure_depart',
        'places_info', 'price', 'status_badge', 'created_at'
    ]
    list_filter = ['status', 'is_confort', 'pause_required', 'date', 'created_at']
    search_fields = [
        'conducteur__email', 'conducteur__first_name', 'conducteur__last_name',
        'ville_depart', 'ville_arrivee'
    ]
    date_hierarchy = 'date'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations du trajet', {
            'fields': ('conducteur', 'ville_depart', 'ville_arrivee', 
                      'adresse_depart', 'adresse_arrivee', 'date', 'heure_depart')
        }),
        ('Capacité', {
            'fields': ('nbr_places', 'places_disponibles')
        }),
        ('Tarification', {
            'fields': ('price', 'price_platform', 'price_driver', 'suggested_price')
        }),
        ('Options', {
            'fields': ('distance', 'is_confort', 'pause_required', 
                      'luggage_allowed', 'description')
        }),
        ('Statut', {
            'fields': ('status',)
        }),
    )
    
    readonly_fields = ['price_platform', 'price_driver', 'places_disponibles', 
                      'pause_required', 'suggested_price']
    
    def route(self, obj):
        return f"{obj.ville_depart} → {obj.ville_arrivee}"
    route.short_description = 'Trajet'
    
    def places_info(self, obj):
        return f"{obj.places_disponibles}/{obj.nbr_places}"
    places_info.short_description = 'Places'
    
    def status_badge(self, obj):
        colors = {
            'ACTIVE': 'green',
            'COMPLETED': 'blue',
            'CANCELLED': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Statut'
    
    actions = ['cancel_trajets', 'complete_trajets']
    
    def cancel_trajets(self, request, queryset):
        updated = queryset.filter(status='ACTIVE').update(status='CANCELLED')
        self.message_user(request, f'{updated} trajet(s) annulé(s)')
    cancel_trajets.short_description = "Annuler les trajets"
    
    def complete_trajets(self, request, queryset):
        updated = queryset.filter(status='ACTIVE').update(status='COMPLETED')
        self.message_user(request, f'{updated} trajet(s) terminé(s)')
    complete_trajets.short_description = "Marquer comme terminés"


@admin.register(TrajetEtape)
class TrajetEtapeAdmin(admin.ModelAdmin):
    list_display = ['trajet', 'ordre', 'ville', 'heure_arrivee']
    list_filter = ['trajet__date']
    search_fields = ['trajet__ville_depart', 'trajet__ville_arrivee', 'ville']


@admin.register(FuelPrice)
class FuelPriceAdmin(admin.ModelAdmin):
    list_display = ['wilaya', 'fuel_type', 'price_per_liter', 'effective_date']
    list_filter = ['fuel_type', 'effective_date', 'wilaya']
    search_fields = ['wilaya']
    date_hierarchy = 'effective_date'


# ============================================================================
# apps/reservations/admin.py - Administration des réservations
# ============================================================================

from django.contrib import admin
from app.reservations.models import Reservation, Rating


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'trajet_info', 'passager', 'nbr_places',
        'status_badge', 'total_price', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'approved_at']
    search_fields = [
        'passager__email', 'trajet__ville_depart', 
        'trajet__ville_arrivee', 'trajet__conducteur__email'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Réservation', {
            'fields': ('trajet', 'passager', 'nbr_places')
        }),
        ('Tarification', {
            'fields': ('price_per_seat', 'total_price')
        }),
        ('Statut', {
            'fields': ('status', 'rejection_reason', 'cancellation_reason')
        }),
        ('Dates', {
            'fields': ('created_at', 'approved_at', 'cancelled_at')
        }),
    )
    
    readonly_fields = ['created_at', 'approved_at', 'cancelled_at', 
                      'price_per_seat', 'total_price']
    
    def trajet_info(self, obj):
        return f"{obj.trajet.ville_depart} → {obj.trajet.ville_arrivee} ({obj.trajet.date})"
    trajet_info.short_description = 'Trajet'
    
    def status_badge(self, obj):
        colors = {
            'PENDING': 'orange',
            'CONFIRMED': 'green',
            'REJECTED': 'red',
            'CANCELLED': 'gray'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Statut'


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['rater', 'rated', 'note', 'stars_display', 'created_at']
    list_filter = ['note', 'created_at']
    search_fields = ['rater__email', 'rated__email', 'comment']
    date_hierarchy = 'created_at'
    
    def stars_display(self, obj):
        stars = '⭐' * obj.note
        return format_html('<span style="font-size: 16px;">{}</span>', stars)
    stars_display.short_description = 'Étoiles'


# ============================================================================
# apps/messaging/admin.py - Administration de la messagerie
# ============================================================================

from django.contrib import admin
from app.messaging.models import Message, Conversation


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'sender', 'receiver', 'text_preview', 
        'trajet', 'is_read', 'created_at'
    ]
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__email', 'receiver__email', 'text']
    date_hierarchy = 'created_at'
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Message'


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'participants_list', 'trajet', 'last_activity']
    list_filter = ['last_activity', 'created_at']
    date_hierarchy = 'last_activity'
    
    def participants_list(self, obj):
        return ', '.join([u.email for u in obj.participants.all()])
    participants_list.short_description = 'Participants'


# ============================================================================
# apps/notifications/admin.py - Administration des notifications
# ============================================================================

from django.contrib import admin
from app.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'recipient', 'type', 'content_preview',
        'is_read', 'created_at'
    ]
    list_filter = ['type', 'is_read', 'created_at']
    search_fields = ['recipient__email', 'content']
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenu'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notification(s) marquée(s) comme lue(s)')
    mark_as_read.short_description = "Marquer comme lues"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notification(s) marquée(s) comme non lues')
    mark_as_unread.short_description = "Marquer comme non lues"