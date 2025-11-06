import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { Loader2, Send } from 'lucide-react';
import Card from './Card';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Assignment {
  id: string;
  title: string;
  members: Profile[];
}

interface AssignmentMessage {
  id: string;
  created_at: string;
  assignment_id: string;
  sender_id: string;
  content: string;
  sender_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface AssignmentChatProps {
  assignment: Assignment;
  adminUser: User | null;
}

const AdminAssignmentChat: React.FC<AssignmentChatProps> = ({ assignment, adminUser }) => {
  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data: messagesData, error } = await supabase
          .from('assignment_messages')
          .select('*')
          .eq('assignment_id', assignment.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch sender profiles for each message
        const messagesWithProfiles = await Promise.all(
          (messagesData || []).map(async (msg) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', msg.sender_id)
              .maybeSingle();

            return {
              ...msg,
              sender_profile: profile || { first_name: null, last_name: null, avatar_url: null }
            };
          })
        );

        setMessages(messagesWithProfiles);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`assignment-chat-${assignment.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'assignment_messages',
        filter: `assignment_id=eq.${assignment.id}`
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .maybeSingle();

        const newMsg = {
          ...payload.new,
          sender_profile: profile || { first_name: null, last_name: null, avatar_url: null }
        } as AssignmentMessage;

        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignment.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await (supabase as any)
        .from('assignment_messages')
        .insert({
          assignment_id: assignment.id,
          sender_id: adminUser.id,
          content: content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Project Chat" className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => {
            const isSender = msg.sender_id === adminUser?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                <img
                  src={msg.sender_profile.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender_profile.first_name}+${msg.sender_profile.last_name}&background=random`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className={`p-3 rounded-lg max-w-xs ${isSender ? 'bg-[#FF5722] text-white' : 'bg-white border'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isSender ? 'text-orange-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </Card>
  );
};

export default AdminAssignmentChat;
