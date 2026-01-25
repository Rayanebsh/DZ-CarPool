import { renderHook, act } from '@testing-library/react';
import { useNotificationsStore } from '@/stores/notifications-store';

describe('NotificationsStore (Zustand)', () => {
  beforeEach(() => {
    useNotificationsStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  test('addNotification() adds notification and updates count', () => {
    const { result } = renderHook(() => useNotificationsStore());
    const notification = {
      id: 1,
      type: 'trip' as const,
      title: 'New Trip',
      message: 'A new trip is available',
      timestamp: new Date().toISOString(),
      read: false,
    };

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  test('markAsRead() marks notification as read', () => {
    const { result } = renderHook(() => useNotificationsStore());
    const notification = {
      id: 1,
      type: 'message' as const,
      title: 'Message',
      message: 'New message',
      timestamp: new Date().toISOString(),
      read: false,
    };

    act(() => {
      result.current.addNotification(notification);
    });

    act(() => {
      result.current.markAsRead(1);
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('markAllAsRead() marks all as read', () => {
    const { result } = renderHook(() => useNotificationsStore());

    act(() => {
      result.current.addNotification({
        id: 1,
        type: 'trip' as const,
        title: 'Trip 1',
        message: 'Message 1',
        timestamp: new Date().toISOString(),
        read: false,
      });
      result.current.addNotification({
        id: 2,
        type: 'message' as const,
        title: 'Message 2',
        message: 'Message 2',
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  test('deleteNotification() removes notification', () => {
    const { result } = renderHook(() => useNotificationsStore());

    act(() => {
      result.current.addNotification({
        id: 1,
        type: 'trip' as const,
        title: 'Trip',
        message: 'Message',
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    act(() => {
      result.current.deleteNotification(1);
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });
});
