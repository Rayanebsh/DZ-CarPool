// hooks/useWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: number;
  sender: {
    id: number;
    full_name: string;
    email: string;
    photo?: string;
  };
  text: string;
  created_at: string;
  is_read?: boolean;
  media_url?: string; // ✅ Déjà l'URL complète depuis le backend
  media_type?: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface UseWebSocketProps {
  conversationType: 'group' | 'private';
  conversationId: string;
  onTyping?: (user: User, isTyping: boolean) => void;
}

export function useWebSocket({
  conversationType,
  conversationId,
  onTyping,
}: UseWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const connect = useCallback(() => {
    if (!conversationId) {
      console.log('⏸️ Pas de conversation sélectionnée');
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('❌ Pas de token JWT trouvé');
      setError('Token JWT manquant. Veuillez vous reconnecter.');
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsHost = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000';

    if (wsHost.startsWith('http://') || wsHost.startsWith('https://')) {
      wsHost = wsHost.replace(/^https?:\/\//, '');
    }

    const url = `${wsProtocol}//${wsHost}/ws/chat/${conversationType}/${conversationId}/?token=${token}`;

    console.log('🔌 Connexion WebSocket:', url);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connecté');
        setIsConnected(true);
        setError('');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Message reçu:', data);

          if (data.type === 'message' || !data.type) {
            // ✅ Le message reçu du WebSocket contient déjà media_url construit par le backend
            setMessages((prev) => [...prev, data]);
          } else if (data.type === 'typing' && onTyping) {
            onTyping(data.user, data.is_typing);
          } else if (data.type === 'history') {
            console.log(
              '📜 Historique chargé:',
              data.messages?.length || 0,
              'messages',
            );
            if (data.messages && Array.isArray(data.messages)) {
              // ✅ Les messages de l'historique contiennent déjà media_url
              setMessages(data.messages);
            }
          }
        } catch (err) {
          console.error('❌ Erreur parsing:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ Erreur WebSocket:', event);
        setError('Erreur de connexion WebSocket');
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket fermé', event.code, event.reason);
        setIsConnected(false);

        if (event.code === 1000 || event.code === 4001) {
          return;
        }

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            10000,
          );
          console.log(`🔄 Reconnexion dans ${delay}ms`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError('Impossible de se connecter au serveur');
        }
      };
    } catch (err) {
      console.error('❌ Erreur création WebSocket:', err);
      setError('Impossible de créer la connexion');
    }
  }, [conversationId, conversationType, onTyping]);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket pas connecté');
      setError('Non connecté');
      return;
    }

    try {
      const payload = {
        type: 'message',
        text,
      };

      console.log('📤 Envoi:', payload);
      wsRef.current.send(JSON.stringify(payload));
    } catch (err) {
      console.error('❌ Erreur envoi:', err);
      setError('Erreur envoi message');
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current.send(
        JSON.stringify({ type: 'typing', is_typing: isTyping }),
      );
    } catch (err) {
      console.error('❌ Erreur envoi typing:', err);
    }
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnexion manuelle');
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
    if (!conversationId) {
      return;
    }

    connect();

    return () => {
      console.log('🧹 Cleanup WebSocket');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('🔌 Fermeture WebSocket (cleanup)');
        wsRef.current.close(1000, 'Changement de conversation');
      }

      wsRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId]);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    sendTyping,
    reconnect,
    addMessage,
  };
}
