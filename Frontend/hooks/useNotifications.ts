// hooks/useNotifications.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface NotificationSender {
  id: number;
  full_name: string;
  email: string;
  photo?: string;
}

interface Notification {
  id: number;
  type: string;
  content: string;
  timestamp?: string;
  created_at: string;
  read: boolean;
  is_read: boolean;
  sender?: NotificationSender;
  sender_detail?: NotificationSender;
  related_model?: string;
  related_id?: number;
  related_object?: {
    type: string;
    id: number;
    summary: string;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  reconnect: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const unreadCount = notifications.filter((n) => n.is_read === false).length;

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost =
      process.env.NEXT_PUBLIC_WS_URL?.replace(/^https?:\/\//, '') ||
      'localhost:8000';
    const url = `${wsProtocol}//${wsHost}/ws/notifications/?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WS Notifications connecté');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🔔 PARSED WS message:', data);

      // 1) Liste de notifications non lues envoyée au connect
      if (
        data.type === 'unread_notifications' &&
        Array.isArray(data.notifications)
      ) {
        const mapped: Notification[] = data.notifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          content: n.content,
          created_at: n.created_at,
          timestamp: n.created_at,
          read: n.is_read,
          is_read: n.is_read,
          sender: n.sender_detail,
          sender_detail: n.sender_detail,
          related_model: n.related_model,
          related_id: n.related_id,
          related_object: n.related_object,
        }));

        setNotifications(mapped);
        return;
      }

      // 2) Nouvelle notification temps réel
      if (data.type === 'new_notification' && data.notification) {
        const n = data.notification;

        const newNotification: Notification = {
          id: n.id,
          type: n.type,
          content: n.content,
          created_at: n.created_at,
          timestamp: n.created_at,
          read: n.is_read,
          is_read: n.is_read,
          sender: n.sender_detail,
          sender_detail: n.sender_detail,
          related_model: n.related_model,
          related_id: n.related_id,
          related_object: n.related_object,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        return;
      }

      console.warn('⚠️ Payload WS inattendu:', data);
    };

    ws.onerror = (err) => console.error('❌ WS erreur:', err);

    ws.onclose = (event) => {
      console.log('🔌 WS fermé', event.code, event.reason);
      setIsConnected(false);

      if (
        event.code !== 1000 &&
        reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          10000,
        );
        reconnectAttemptsRef.current++;
        setTimeout(connect, delay);
      }
    };
  }, []);

  const markAsRead = useCallback((id: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'mark_as_read',
          notification_id: id,
        }),
      );
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'mark_all_read',
        }),
      );
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Appel API pour supprimer côté serveur
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((err) => console.error('Erreur suppression notification:', err));
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnexion manuelle notifications');
    reconnectAttemptsRef.current = 0;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setTimeout(connect, 100);
  }, [connect]);

  useEffect(() => {
    // Demander la permission pour les notifications natives
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      console.log('🧹 Cleanup WebSocket Notifications');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Cleanup');
      }

      wsRef.current = null;
      setIsConnected(false);
    };
  }, [connect]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect,
  };
}
