'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import messagingService, {
  ConversationListItem,
} from '@/services/messagingService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  full_name: string;
  email: string;
}

export default function MessagesPage() {
  const { language } = useLanguage();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationListItem | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [messageInput, setMessageInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);

  const [currentUser, setCurrentUser] = useState<User>({
    id: 0,
    full_name: '',
    email: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Erreur parsing user:', error);
        }
      }
    }
  }, []);

  const conversationType: 'group' | 'private' = selectedConversation?.is_group
    ? 'group'
    : 'private';

  const conversationId: string = selectedConversation?.is_group
    ? selectedConversation?.trajet?.id.toString() || ''
    : (() => {
        const otherUser = selectedConversation?.participants.find(
          (p) => p.id !== currentUser.id,
        );
        if (!otherUser) return '';

        const userIds: number[] = [currentUser.id, otherUser.id];
        const sortedIds = userIds.sort((a: number, b: number) => a - b);
        return `${sortedIds[0]}_${sortedIds[1]}`;
      })();

  const {
    messages,
    isConnected,
    sendMessage,
    sendTyping,
    reconnect,
    error: wsError,
    addMessage,
  } = useWebSocket({
    conversationType,
    conversationId,
    onTyping: (user: User, isTyping: boolean) => {
      if (isTyping && user.id !== currentUser.id) {
        setTypingUsers((prev) => [...new Set([...prev, user.full_name])]);
      } else {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== user.full_name),
        );
      }
    },
  });

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      isUserScrollingRef.current = !isAtBottom;
      lastScrollTopRef.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getMyConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert(
        language === 'en'
          ? 'Only JPG, PNG and PDF files are allowed'
          : 'Seuls les fichiers JPG, PNG et PDF sont autorisés',
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        language === 'en'
          ? 'File size must be less than 5MB'
          : 'La taille du fichier doit être inférieure à 5MB',
      );
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !isConnected) return;

    try {
      if (selectedFile) {
        setUploadingFile(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const endpoint = `${apiUrl}/api/v1/messaging/messages/upload-media/`;

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              },
              body: JSON.stringify({
                conversation_type: conversationType,
                conversation_id: conversationId,
                text: messageInput.trim(),
                media: base64,
                media_type: selectedFile.type,
                media_name: selectedFile.name,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('❌ Erreur API:', response.status, errorData);
              throw new Error(
                errorData.error || "Erreur lors de l'envoi du fichier",
              );
            }

            const data = await response.json();
            addMessage(data);

            setMessageInput('');
            handleRemoveFile();
            setUploadingFile(false);
          } catch (error) {
            console.error('❌ Erreur upload:', error);
            alert(
              language === 'en'
                ? `Error sending file: ${error instanceof Error ? error.message : 'Unknown error'}`
                : `Erreur lors de l'envoi du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            );
            setUploadingFile(false);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        sendMessage(messageInput);
        setMessageInput('');
        sendTyping(false);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setUploadingFile(false);
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (value.trim()) {
      sendTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    } else {
      sendTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationTitle = (conv: ConversationListItem) => {
    if (conv.is_group && conv.trajet) {
      return `${conv.trajet.ville_depart} → ${conv.trajet.ville_arrivee}`;
    }
    const otherUser = conv.participants.find((p) => p.id !== currentUser.id);
    return otherUser?.full_name || 'Conversation';
  };

  const getConversationSubtitle = (conv: ConversationListItem) => {
    if (conv.is_group) {
      return `${conv.participants.length} ${language === 'en' ? 'participants' : 'participants'}`;
    }
    const otherUser = conv.participants.find((p) => p.id !== currentUser.id);
    return otherUser?.email || '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {language === 'en' ? 'Messages' : 'Messages'}
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={
                      language === 'en'
                        ? 'Search conversations...'
                        : 'Rechercher...'
                    }
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF5722]" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500 px-4">
                    <p className="text-sm text-center">
                      {language === 'en'
                        ? 'No conversations yet. Book a trip to start chatting!'
                        : 'Aucune conversation. Réservez un trajet pour commencer à discuter !'}
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                        selectedConversation?.id === conv.id
                          ? 'bg-[#FF5722]/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full bg-[#FF5722]/10 flex items-center justify-center">
                            <span className="text-[#FF5722] font-semibold text-lg">
                              {conv.is_group
                                ? '👥'
                                : conv.participants.find(
                                    (p) => p.id !== currentUser.id,
                                  )?.full_name[0] || '?'}
                            </span>
                          </div>
                          {(conv.unread_count || 0) > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5722] rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {conv.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {getConversationTitle(conv)}
                            </h3>
                            <span className="text-xs text-gray-500 shrink-0">
                              {new Date(conv.last_activity).toLocaleDateString(
                                'fr-FR',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {getConversationSubtitle(conv)}
                          </p>
                          {conv.last_message && (
                            <p className="text-sm text-gray-600 truncate">
                              {conv.last_message.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getConversationTitle(selectedConversation)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-gray-500">
                          {isConnected
                            ? language === 'en'
                              ? 'Connected'
                              : 'Connecté'
                            : language === 'en'
                              ? 'Disconnected'
                              : 'Déconnecté'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isConnected && (
                        <Button onClick={reconnect} variant="outline" size="sm">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'en' ? 'Reconnect' : 'Reconnecter'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {wsError && (
                    <Alert variant="destructive" className="m-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{wsError}</AlertDescription>
                    </Alert>
                  )}

                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                  >
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {language === 'en'
                          ? 'No messages yet. Start the conversation!'
                          : 'Aucun message pour le moment. Lancez la conversation !'}
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser =
                          message.sender.id === currentUser.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md ${
                                isCurrentUser
                                  ? 'bg-[#FF5722] text-white rounded-2xl rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-2xl rounded-bl-none shadow-sm'
                              } px-4 py-2`}
                            >
                              {!isCurrentUser && (
                                <p className="text-xs font-semibold mb-1 opacity-70">
                                  {message.sender.full_name}
                                </p>
                              )}

                              {message.media_url && (
                                <div className="mb-2">
                                  {message.media_type?.startsWith('image/') ? (
                                    <img
                                      src={message.media_url}
                                      alt="Pièce jointe"
                                      className="rounded-lg max-w-full h-auto"
                                      onError={(e) => {
                                        console.error(
                                          '❌ Erreur chargement image:',
                                          {
                                            url: message.media_url,
                                            message_id: message.id,
                                          },
                                        );
                                        e.currentTarget.style.display = 'none';
                                        const parent =
                                          e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <div class="bg-gray-200 rounded-lg p-4 text-center text-sm text-gray-600">
                                              ❌ ${language === 'en' ? 'Error loading image' : 'Erreur de chargement'}
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <a
                                      href={message.media_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm underline"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      {language === 'en'
                                        ? 'View attachment'
                                        : 'Voir la pièce jointe'}
                                    </a>
                                  )}
                                </div>
                              )}

                              {message.text && (
                                <p className="text-sm break-words">
                                  {message.text}
                                </p>
                              )}

                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser
                                    ? 'text-white/70'
                                    : 'text-gray-500'
                                }`}
                              >
                                {new Date(
                                  message.created_at,
                                ).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-none shadow-sm px-4 py-2">
                          <p className="text-sm text-gray-500 italic">
                            {typingUsers.join(', ')}{' '}
                            {typingUsers.length > 1
                              ? language === 'en'
                                ? 'are typing...'
                                : "sont en train d'écrire..."
                              : language === 'en'
                                ? 'is typing...'
                                : "est en train d'écrire..."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-white">
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Aperçu"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <Paperclip className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          onClick={handleRemoveFile}
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isConnected || uploadingFile}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Input
                        type="text"
                        placeholder={
                          language === 'en'
                            ? 'Type a message...'
                            : 'Tapez un message...'
                        }
                        value={messageInput}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!isConnected || uploadingFile}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !isConnected ||
                          (!messageInput.trim() && !selectedFile) ||
                          uploadingFile
                        }
                        className="bg-[#FF5722] hover:bg-[#E64A19] text-white disabled:opacity-50"
                        size="sm"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  {language === 'en'
                    ? 'Select a conversation to start messaging'
                    : 'Sélectionnez une conversation pour commencer'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
