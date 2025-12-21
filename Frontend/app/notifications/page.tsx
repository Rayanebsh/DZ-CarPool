'use client';

import { useState } from 'react';
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

export default function NotificationsPage() {
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
    {
      id: 4,
      type: 'alert',
      title: language === 'en' ? 'Trip Reminder' : 'Rappel de trajet',
      message:
        language === 'en'
          ? 'Your trip to Constantine starts in 24 hours'
          : 'Votre trajet vers Constantine commence dans 24 heures',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'trip',
      title: language === 'en' ? 'Booking Confirmed' : 'Réservation confirmée',
      message:
        language === 'en'
          ? 'Your seat for Oran → Algiers has been confirmed'
          : 'Votre siège pour Oran → Alger a été confirmé',
      timestamp: '1 day ago',
      read: true,
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
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

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
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-[#FF5722]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {notification.avatar ? (
                        <Image
                          src={notification.avatar || '/placeholder.svg'}
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
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="shrink-0 -mt-2 -mr-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
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
                .filter((n) => n.type === 'trip' || n.type === 'alert')
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-[#FF5722]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="messages" className="space-y-3">
              {notifications
                .filter((n) => n.type === 'message' || n.type === 'review')
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-[#FF5722]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {notification.avatar && (
                        <Image
                          src={notification.avatar || '/placeholder.svg'}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
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
