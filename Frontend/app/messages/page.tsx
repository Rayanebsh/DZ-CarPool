'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
} from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface Conversation {
  id: number;
  tripId: string;
  participants: string[];
  tripRoute: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

export default function MessagesPage() {
  const { language } = useLanguage();
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(1);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 1,
      tripId: 'TRIP-001',
      participants: ['Ahmed', 'Fatima', 'Karim'],
      tripRoute: 'Algiers → Oran',
      lastMessage: 'See you tomorrow at 8 AM!',
      timestamp: '2 min ago',
      unread: 2,
      avatar: '/placeholder.svg?height=48&width=48',
    },
    {
      id: 2,
      tripId: 'TRIP-002',
      participants: ['Yasmine', 'Mohammed'],
      tripRoute: 'Constantine → Annaba',
      lastMessage: 'Thanks for confirming',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: '/placeholder.svg?height=48&width=48',
    },
  ];

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Ahmed',
      content: 'Hi everyone! Looking forward to the trip tomorrow.',
      timestamp: '10:30 AM',
      isCurrentUser: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Me too! What time should we meet?',
      timestamp: '10:32 AM',
      isCurrentUser: true,
    },
    {
      id: 3,
      sender: 'Fatima',
      content: 'I suggest 8 AM at the meeting point.',
      timestamp: '10:35 AM',
      isCurrentUser: false,
    },
    {
      id: 4,
      sender: 'You',
      content: 'Perfect! See you tomorrow at 8 AM!',
      timestamp: '10:36 AM',
      isCurrentUser: true,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'You',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCurrentUser: true,
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
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

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-[#FF5722]/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <Image
                          src={conv.avatar || '/placeholder.svg'}
                          alt="Avatar"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                        />
                        {conv.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5722] rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {conv.unread}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {conv.tripRoute}
                          </h3>
                          <span className="text-xs text-gray-500 shrink-0">
                            {conv.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {conv.participants.join(', ')} • {conv.tripId}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConv.tripRoute}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConv.participants.length}{' '}
                        {language === 'en' ? 'participants' : 'participants'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            message.isCurrentUser
                              ? 'bg-[#FF5722] text-white rounded-2xl rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none'
                          } px-4 py-2`}
                        >
                          {!message.isCurrentUser && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {message.sender}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${message.isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
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
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleSendMessage()
                        }
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm">
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
                        size="sm"
                      >
                        <Send className="w-5 h-5" />
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
