'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Car,
  MessageCircle,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
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
      case 'TRAJET_CANCELLED':
      case 'TRAJET_MODIFIED':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'WELCOME':
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: { en: string; fr: string } } = {
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
      MESSAGE_RECEIVED: { en: 'Message', fr: 'Message' },
      TRAJET_CANCELLED: { en: 'Trip Cancelled', fr: 'Trajet annulé' },
      WELCOME: { en: 'Welcome', fr: 'Bienvenue' },
    };

    return labels[type]?.[language] || type;
  };

  const handleNotificationClick = (notification: any) => {
    // Marquer comme lue
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // ✅ REDIRECTION SELON LE TYPE
    if (notification.type === 'MESSAGE_RECEIVED') {
      // Rediriger vers les messages
      router.push('/messages');
    } else if (
      notification.type === 'RESERVATION_REQUEST' &&
      notification.related_id
    ) {
      // ✅ Rediriger vers la page de détails de la réservation
      router.push(`/reservations/${notification.related_id}`);
    }
    // Pour RESERVATION_APPROVED, RESERVATION_REJECTED, RESERVATION_CANCELLED -> Ne rien faire
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return language === 'en' ? 'Just now' : "À l'instant";
    if (diffMins < 60)
      return `${diffMins} ${language === 'en' ? 'min ago' : 'min'}`;
    if (diffHours < 24)
      return `${diffHours} ${language === 'en' ? 'hours ago' : 'h'}`;
    if (diffDays < 7)
      return `${diffDays} ${language === 'en' ? 'days ago' : 'j'}`;

    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'en' ? 'Notifications' : 'Notifications'}
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-600">
                  {language === 'en'
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'en'
                  ? 'Mark all as read'
                  : 'Tout marquer comme lu'}
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'All' : 'Toutes'}
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-[#FF5722] text-white">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Trips' : 'Trajets'}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent"
              >
                {language === 'en' ? 'Messages' : 'Messages'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'en'
                      ? 'No notifications yet'
                      : 'Aucune notification pour le moment'}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                      notification.type === 'RESERVATION_REQUEST' ||
                      notification.type === 'MESSAGE_RECEIVED'
                        ? 'cursor-pointer'
                        : ''
                    } ${
                      !notification.is_read
                        ? 'border-l-4 border-l-[#FF5722]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {getTypeLabel(notification.type)}
                            </h3>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-[#FF5722] rounded-full" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="shrink-0 -mt-2 -mr-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              {language === 'en'
                                ? 'Mark as read'
                                : 'Marquer comme lu'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="trips" className="space-y-3">
              {notifications
                .filter(
                  (n) =>
                    n.type === 'RESERVATION_REQUEST' ||
                    n.type === 'RESERVATION_APPROVED' ||
                    n.type === 'RESERVATION_REJECTED' ||
                    n.type === 'RESERVATION_CANCELLED' ||
                    n.type === 'TRAJET_CANCELLED' ||
                    n.type === 'TRAJET_MODIFIED',
                )
                .map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                      notification.type === 'RESERVATION_REQUEST'
                        ? 'cursor-pointer'
                        : ''
                    } ${
                      !notification.is_read
                        ? 'border-l-4 border-l-[#FF5722]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {getTypeLabel(notification.type)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.content}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="messages" className="space-y-3">
              {notifications
                .filter(
                  (n) =>
                    n.type === 'MESSAGE_RECEIVED' ||
                    n.type === 'RATING_RECEIVED',
                )
                .map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md cursor-pointer ${
                      !notification.is_read
                        ? 'border-l-4 border-l-[#FF5722]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {getTypeLabel(notification.type)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.content}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
