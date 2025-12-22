'use client';

import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface Notification {
  id: number;
  type: 'trip' | 'message' | 'review' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
}

// Helper pour typer correctement persist
type NotificationsPersist = PersistOptions<NotificationsState>;

export const useNotificationsStore = create<NotificationsState>()(
  persist<NotificationsState>(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification: Notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.read
            ? state.unreadCount
            : state.unreadCount + 1,
        })),

      markAsRead: (id: number) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
          unreadCount: 0,
        })),

      deleteNotification: (id: number) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount:
              notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          };
        }),
    }),
    {
      name: 'notifications-storage',
    } as NotificationsPersist,
  ),
);
