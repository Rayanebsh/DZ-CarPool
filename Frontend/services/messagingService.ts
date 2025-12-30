// services/messagingService.ts
import api from './api.client';

export interface ConversationListItem {
  id: number;
  is_group: boolean;
  trajet?: {
    id: number;
    ville_depart: string;
    ville_arrivee: string;
    date_depart: string;
    conducteur: {
      id: number;
      full_name: string;
      photo?: string;
    };
  };
  participants: Array<{
    id: number;
    full_name: string;
    email: string;
    photo?: string;
  }>;
  last_message?: {
    text: string;
    created_at: string;
  };
  last_activity: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  sender: {
    id: number;
    full_name: string;
    email: string;
    photo?: string;
  };
  text: string;
  created_at: string;
  is_read: boolean;
}

class MessagingService {
  /**
   * Récupère TOUTES les conversations (groupes + privées)
   */
  async getMyConversations(): Promise<ConversationListItem[]> {
    try {
      const response = await api.get('/messaging/conversations/');

      // L'API peut retourner soit un tableau, soit un objet avec results
      const data = response.data;

      // Si c'est un objet avec results (pagination DRF)
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results as ConversationListItem[];
      }

      // Si c'est directement un tableau
      if (Array.isArray(data)) {
        return data;
      }

      // Sinon retourner un tableau vide
      console.warn('Format de réponse inattendu:', data);
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération conversations:', error);
      return []; // Retourner un tableau vide au lieu de throw
    }
  }

  /**
   * Récupère uniquement les conversations de groupe
   */
  async getMyGroups(): Promise<ConversationListItem[]> {
    try {
      const response = await api.get('/messaging/conversations/my-groups/');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération groupes:', error);
      throw error;
    }
  }

  /**
   * Récupère les messages d'un groupe (trajet)
   */
  async getTripGroupMessages(trajetId: number) {
    try {
      const response = await api.get(
        `/messaging/messages/trip-group/${trajetId}/`,
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération messages groupe:', error);
      throw error;
    }
  }

  /**
   * Récupère les messages privés avec un utilisateur
   */
  async getPrivateMessages(userId: number) {
    try {
      const response = await api.get(`/messaging/messages/private/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération messages privés:', error);
      throw error;
    }
  }

  /**
   * Récupère le nombre de messages non lus
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/messaging/messages/unread_count/');
      return response.data.unread_count;
    } catch (error) {
      console.error('❌ Erreur récupération messages non lus:', error);
      return 0;
    }
  }

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  async markAllAsRead(userId?: number): Promise<void> {
    try {
      await api.post('/messaging/messages/mark_all_read/', {
        user_id: userId,
      });
    } catch (error) {
      console.error('❌ Erreur marquage messages lus:', error);
      throw error;
    }
  }
}

export default new MessagingService();
