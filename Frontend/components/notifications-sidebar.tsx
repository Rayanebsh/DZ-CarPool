'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import {
  X,
  Car,
  MessageCircle,
  Star,
  AlertCircle,
  CheckCircle,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import Image from 'next/image';

interface NotificationData {
  id: number | string;
  type: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_detail?: {
    avatar?: string;
    full_name?: string;
  };
  related_id?: number;
}

interface Notification {
  id: number | string;
  type: 'trip' | 'message' | 'review' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  backendType?: string; // Type original du backend
  relatedId?: number; // ID de la réservation
}

interface NotificationsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsSidebar({
  open,
  onClose,
}: NotificationsSidebarProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  /* =======================
     WEBSOCKET CONNECTION
     ======================= */
  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/notifications/?token=${token}`,
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] notifications connected');
    };

    ws.onmessage = (event) => {
      console.log('[WS] raw message:', event.data);
      const data = JSON.parse(event.data);
      console.log('[WS] parsed:', data);

      // 1) Liste de notifications non lues
      if (
        data.type === 'unread_notifications' &&
        Array.isArray(data.notifications)
      ) {
        const mapped: Notification[] = data.notifications.map(
          (n: NotificationData) => mapBackendNotification(n),
        );

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const merged = [
            ...mapped.filter((m) => !existingIds.has(m.id)),
            ...prev,
          ];
          console.log('[WS] notifications après unread:', merged);
          return merged;
        });

        return;
      }

      // 2) Nouvelle notification temps réel
      if (data.type === 'new_notification' && data.notification) {
        const n = data.notification;
        const newNotification = mapBackendNotification(n);

        setNotifications((prev) => {
          const exists = prev.some((p) => p.id === newNotification.id);
          if (exists) {
            console.log(
              '[WS] Notification déjà présente, ignorée:',
              newNotification.id,
            );
            return prev;
          }
          const next = [newNotification, ...prev];
          console.log('[WS] notifications après new_notification:', next);
          return next;
        });

        return;
      }

      console.warn('[WS] payload inattendu:', data);
    };

    ws.onerror = (event) => {
      const socket = event.target as WebSocket;
      console.error('[WS] error event:', {
        type: event.type,
        readyState: socket.readyState,
        url: socket.url,
      });
    };

    ws.onclose = () => {
      console.log('[WS] notifications closed');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [open]);

  /* =======================
     HELPER: MAP NOTIFICATION
     ======================= */
  const mapBackendNotification = (n: NotificationData): Notification => {
    const uniqueId =
      n.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Mapper le type backend vers le type frontend
    let frontendType: Notification['type'] = 'alert';
    if (n.type === 'MESSAGE_RECEIVED') frontendType = 'message';
    else if (n.type === 'RATING_RECEIVED') frontendType = 'review';
    else if (
      n.type === 'RESERVATION_REQUEST' ||
      n.type === 'RESERVATION_APPROVED' ||
      n.type === 'RESERVATION_REJECTED' ||
      n.type === 'RESERVATION_CANCELLED'
    ) {
      frontendType = 'trip';
    }

    // Titre selon le type
    const typeLabels: { [key: string]: { en: string; fr: string } } = {
      RESERVATION_REQUEST: {
        en: 'Reservation Request',
        fr: 'Demande de réservation',
      },
      RESERVATION_APPROVED: {
        en: 'Reservation Approved',
        fr: 'Réservation acceptée',
      },
      RESERVATION_REJECTED: {
        en: 'Reservation Rejected',
        fr: 'Réservation refusée',
      },
      RESERVATION_CANCELLED: {
        en: 'Reservation Cancelled',
        fr: 'Réservation annulée',
      },
      MESSAGE_RECEIVED: { en: 'New Message', fr: 'Nouveau message' },
      RATING_RECEIVED: { en: 'New Review', fr: 'Nouvel avis' },
    };

    const title = typeLabels[n.type]?.[language] || n.content || 'Notification';

    return {
      id: uniqueId,
      type: frontendType,
      backendType: n.type, // Garder le type original
      relatedId: n.related_id, // ID de la réservation
      title,
      message: n.content || '',
      timestamp: n.created_at || new Date().toLocaleString(),
      read: n.is_read || false,
      avatar: n.sender_detail?.avatar,
    };
  };

  /* =======================
     HANDLE NOTIFICATION CLICK
     ======================= */
  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue
    markAsRead(notification.id);

    // ✅ REDIRECTION SELON LE TYPE
    if (notification.backendType === 'MESSAGE_RECEIVED') {
      onClose();
      router.push('/messages');
    } else if (
      notification.backendType === 'RESERVATION_REQUEST' &&
      notification.relatedId
    ) {
      onClose();
      router.push(`/reservations/${notification.relatedId}`);
    }
    // Pour RESERVATION_APPROVED, RESERVATION_REJECTED, RESERVATION_CANCELLED -> Ne rien faire
  };

  /* =======================
     UI HELPERS
     ======================= */
  const markAsRead = (id: number | string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (backendType?: string) => {
    switch (backendType) {
      case 'RESERVATION_REQUEST':
        return <Car className="w-5 h-5 text-[#FF5722]" />;
      case 'RESERVATION_APPROVED':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      case 'RESERVATION_REJECTED':
        return <UserX className="w-5 h-5 text-red-500" />;
      case 'RESERVATION_CANCELLED':
        return <X className="w-5 h-5 text-gray-500" />;
      case 'MESSAGE_RECEIVED':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'RATING_RECEIVED':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  /* =======================
     BODY SCROLL LOCK
     ======================= */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'en' ? 'Notifications' : 'Notifications'}
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">
                {unreadCount} {language === 'en' ? 'unread' : 'non lues'}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="w-full justify-start text-[#FF5722] hover:text-[#E64A19] hover:bg-[#FF5722]/10"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Mark all as read' : 'Tout marquer comme lu'}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {language === 'en' ? 'No notifications' : 'Aucune notification'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 transition-colors ${
                    notification.backendType === 'RESERVATION_REQUEST' ||
                    notification.backendType === 'MESSAGE_RECEIVED'
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'hover:bg-gray-50'
                  } ${!notification.read ? 'bg-[#FF5722]/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {notification.avatar ? (
                      <Image
                        src={notification.avatar}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.backendType)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#FF5722] shrink-0 ml-2 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              {language === 'en' ? 'Mark read' : 'Lu'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-7 w-7"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onClose();
              router.push('/notifications');
            }}
          >
            {language === 'en'
              ? 'View all notifications'
              : 'Voir toutes les notifications'}
          </Button>
        </div>
      </div>
    </>
  );
}
