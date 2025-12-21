'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Image from 'next/image';

interface Notification {
  id: number;
  type: 'trip' | 'message' | 'review' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'trip',
      title:
        language === 'en'
          ? 'New Booking Request'
          : 'Nouvelle demande de réservation',
      message:
        language === 'en'
          ? 'Ahmed wants to book a seat for Algiers → Oran trip'
          : 'Ahmed veut réserver un siège pour le trajet Alger → Oran',
      timestamp: '5 min ago',
      read: false,
      avatar: '/placeholder.svg?height=40&width=40',
    },
    {
      id: 2,
      type: 'message',
      title: language === 'en' ? 'New Message' : 'Nouveau message',
      message:
        language === 'en'
          ? "Fatima sent you a message about tomorrow's trip"
          : 'Fatima vous a envoyé un message concernant le trajet de demain',
      timestamp: '1 hour ago',
      read: false,
      avatar: '/placeholder.svg?height=40&width=40',
    },
    {
      id: 3,
      type: 'review',
      title: language === 'en' ? 'New Review' : 'Nouvel avis',
      message:
        language === 'en'
          ? 'Karim left you a 5-star review'
          : 'Karim vous a laissé un avis 5 étoiles',
      timestamp: '2 hours ago',
      read: true,
      avatar: '/placeholder.svg?height=40&width=40',
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'trip':
        return <Car className="w-5 h-5 text-[#FF5722]" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
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
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-[#FF5722]/5' : ''
                  }`}
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
                        {getIcon(notification.type)}
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
                              onClick={() => markAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              {language === 'en' ? 'Mark read' : 'Lu'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
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
              window.location.href = '/notifications';
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
