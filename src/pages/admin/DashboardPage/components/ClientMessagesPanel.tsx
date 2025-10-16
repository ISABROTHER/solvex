import React, { useState } from 'react';
import { Send, Paperclip, User, Bot } from 'lucide-react';
import { ClientMessage } from '../../../../types/client-sync.types';

interface ClientMessagesPanelProps {
  requestId: string;
  clientName: string;
}

const ClientMessagesPanel: React.FC<ClientMessagesPanelProps> = ({ requestId, clientName }) => {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ClientMessage = {
      id: `msg-${Date.now()}`,
      request_id: requestId,
      sender_id: 'admin-1',
      sender_name: 'Admin',
      sender_role: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
      is_read: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gradient-to-r from-[#FF5722] to-[#C10100] text-white p-4">
        <h3 className="font-bold text-lg">Conversation with {clientName}</h3>
        <p className="text-sm text-white/80">Real-time messaging</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot size={48} className="mb-4 text-gray-400" />
            <p className="text-center">No messages yet</p>
            <p className="text-sm text-center mt-1">Start a conversation with the client</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
              rows={2}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: ClientMessage }> = ({ message }) => {
  const isAdmin = message.sender_role === 'admin';

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`p-2 rounded-full ${isAdmin ? 'bg-[#FF5722]' : 'bg-gray-400'}`}>
          {isAdmin ? (
            <Bot size={16} className="text-white" />
          ) : (
            <User size={16} className="text-white" />
          )}
        </div>
        <div>
          <div
            className={`px-4 py-2 rounded-lg ${
              isAdmin
                ? 'bg-[#FF5722] text-white rounded-tr-none'
                : 'bg-white border border-gray-200 rounded-tl-none'
            }`}
          >
            <p className={`text-xs font-semibold mb-1 ${isAdmin ? 'text-white/90' : 'text-gray-600'}`}>
              {message.sender_name}
            </p>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientMessagesPanel;
