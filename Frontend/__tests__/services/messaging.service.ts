import messagingService, {
  ConversationListItem,
} from '@/services/messagingService';
import api from '@/services/api.client';

jest.mock('@/services/api.client');

const mockedApi = api as jest.Mocked<typeof api>;

describe('MessagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------
  // getMyConversations
  // ----------------------
  describe('getMyConversations', () => {
    test('retourne un tableau quand API renvoie results (pagination DRF)', async () => {
      const conversations: ConversationListItem[] = [
        {
          id: 1,
          is_group: false,
          participants: [],
          last_activity: '2025-01-01T00:00:00Z',
        },
      ];

      mockedApi.get.mockResolvedValueOnce({
        data: { results: conversations },
      } as any);

      const result = await messagingService.getMyConversations();

      expect(mockedApi.get).toHaveBeenCalledWith('/messaging/conversations/');
      expect(result).toEqual(conversations);
    });

    test('retourne un tableau quand API renvoie directement un array', async () => {
      const conversations: ConversationListItem[] = [
        {
          id: 2,
          is_group: true,
          participants: [],
          last_activity: '2025-01-02T00:00:00Z',
        },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: conversations } as any);

      const result = await messagingService.getMyConversations();

      expect(result).toEqual(conversations);
    });

    test('retourne [] et log un warn sur format inattendu (objet sans results)', async () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      mockedApi.get.mockResolvedValueOnce({
        data: { foo: 'bar' },
      } as any);

      const result = await messagingService.getMyConversations();

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual([]);

      consoleWarnSpy.mockRestore();
    });

    test('retourne [] sur erreur réseau et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await messagingService.getMyConversations();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual([]);

      consoleErrorSpy.mockRestore();
    });
  });

  // ----------------------
  // getMyGroups
  // ----------------------
  describe('getMyGroups', () => {
    test('retourne les groupes', async () => {
      const groups: ConversationListItem[] = [
        {
          id: 1,
          is_group: true,
          participants: [],
          last_activity: '2025-01-01T00:00:00Z',
        },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: groups } as any);

      const result = await messagingService.getMyGroups();

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/messaging/conversations/my-groups/',
      );
      expect(result).toEqual(groups);
    });

    test('throw sur erreur et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Forbidden');

      mockedApi.get.mockRejectedValueOnce(error);

      await expect(messagingService.getMyGroups()).rejects.toThrow('Forbidden');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  // ----------------------
  // getTripGroupMessages
  // ----------------------
  describe('getTripGroupMessages', () => {
    test('retourne les messages du groupe de trajet', async () => {
      const messages = [{ id: 1, text: 'Hello' }];

      mockedApi.get.mockResolvedValueOnce({ data: messages } as any);

      const result = await messagingService.getTripGroupMessages(42);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/messaging/messages/trip-group/42/',
      );
      expect(result).toEqual(messages);
    });

    test('throw sur erreur et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Network error');

      mockedApi.get.mockRejectedValueOnce(error);

      await expect(messagingService.getTripGroupMessages(42)).rejects.toThrow(
        'Network error',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  // ----------------------
  // getPrivateMessages
  // ----------------------
  describe('getPrivateMessages', () => {
    test('retourne les messages privés', async () => {
      const messages = [{ id: 1, text: 'Hi' }];

      mockedApi.get.mockResolvedValueOnce({ data: messages } as any);

      const result = await messagingService.getPrivateMessages(7);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/messaging/messages/private/7/',
      );
      expect(result).toEqual(messages);
    });

    test('throw sur erreur et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Unauthorized');

      mockedApi.get.mockRejectedValueOnce(error);

      await expect(messagingService.getPrivateMessages(7)).rejects.toThrow(
        'Unauthorized',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  // ----------------------
  // getUnreadCount
  // ----------------------
  describe('getUnreadCount', () => {
    test('retourne le nombre de messages non lus', async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { unread_count: 5 },
      } as any);

      const result = await messagingService.getUnreadCount();

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/messaging/messages/unread_count/',
      );
      expect(result).toBe(5);
    });

    test('retourne 0 sur erreur et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await messagingService.getUnreadCount();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toBe(0);

      consoleErrorSpy.mockRestore();
    });
  });

  // ----------------------
  // markAllAsRead
  // ----------------------
  describe('markAllAsRead', () => {
    test('envoie user_id quand fourni', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: {} } as any);

      await messagingService.markAllAsRead(10);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/messaging/messages/mark_all_read/',
        { user_id: 10 },
      );
    });

    test('envoie user_id undefined quand non fourni', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: {} } as any);

      await messagingService.markAllAsRead();

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/messaging/messages/mark_all_read/',
        { user_id: undefined },
      );
    });

    test('throw sur erreur et log une erreur', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Server error');

      mockedApi.post.mockRejectedValueOnce(error);

      await expect(messagingService.markAllAsRead(5)).rejects.toThrow(
        'Server error',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
