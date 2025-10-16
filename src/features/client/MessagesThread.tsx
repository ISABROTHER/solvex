// src/components/client/MessagesThread.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCheck } from 'lucide-react';
import { useClientMock } from './useClientMock';

interface MessagesThreadProps {
    requestId: string;
}

const MessagesThread: React.FC<MessagesThreadProps> = ({ requestId }) => {
    const { messages, addMessage, client } = useClientMock();
    const [newMessage, setNewMessage] = useState('');

    const threadMessages = messages.filter(m => m.requestId === requestId);

    const handleSend = () => {
        if (newMessage.trim()) {
            addMessage({
                requestId,
                sender: { name: client.firstName, role: 'client', avatarUrl: client.avatarUrl },
                content: newMessage,
            });
            setNewMessage('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col h-[60vh]">
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">Project Communication</h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {threadMessages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender.role === 'client' ? 'justify-end' : ''}`}>
                         {msg.sender.role === 'admin' && <img src={msg.sender.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=A`} className="h-6 w-6 rounded-full" />}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender.role === 'client' ? 'bg-brand text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`text-xs mt-1 flex items-center gap-1 ${msg.sender.role === 'client' ? 'text-gray-200' : 'text-gray-400'}`}>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.sender.role === 'client' && <CheckCheck className={`h-4 w-4 ${msg.isRead ? 'text-blue-300' : ''}`} />}
                            </div>
                        </div>
                         {msg.sender.role === 'client' && <img src={msg.sender.avatarUrl} className="h-6 w-6 rounded-full" />}
                    </div>
                ))}
            </div>
            <div className="p-4 border-t dark:border-gray-700">
                <div className="relative">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="w-full pr-12 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand text-white hover:bg-brand-dark">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesThread;
