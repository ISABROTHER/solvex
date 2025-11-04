// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { Loader2, Send } from 'lucide-react';
import Card from './Card';
import { User } from '@supabase/supabase-js';

// --- PLANNED TYPES (Same as AssignmentsTab) ---
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type Assignment = {
  id: number;
  title: string;
  members: Profile[];
};

type AssignmentMessage = {
  id: number;
  created_at: string;
  assignment_id: number;
  sender_id: string;
  content: string;
  sender_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

// --- MOCK DATA (to build the UI) ---
const MOCK_MESSAGES: AssignmentMessage[] = [
  { id: 1, created_at: "2025-11-04T10:30:00Z", assignment_id: 1, sender_id: '1a', content: 'Hey admin, I\'ve started on the social media plan.', sender_profile: { first_name: 'John', last_name: 'Doe', avatar_url: null } },
  { id: 2, created_at: "2025-11-04T10:31:00Z", assignment_id: 1, sender_id: '2b', content: 'I\'ll work on the ad copy.', sender_profile: { first_name: 'Jane', last_name: 'Smith', avatar_url: null } },
  { id: 3, created_at: "2025-11-04T10:35:00Z", assignment_id: 1, sender_id: 'admin_id', content: 'Great, let me know if you need any resources.', sender_profile: { first_name: 'Admin', last_name: 'User', avatar_url: null } },
];
// --- END MOCK DATA ---


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
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // --- MOCK FETCHER ---
    const fetchMessages = async () => {
      setLoading(true);
      // const { data, error } = await supabase
      //   .from('assignment_messages')
      //   .select(`*, sender_profile:profiles(first_name, last_name, avatar_url)`)
      //   .eq('assignment_id', assignment.id)
      //   .order('created_at', { ascending: true });

      // if (error) console.error('Error fetching messages:', error);
      // else setMessages(data || []);

      setMessages(MOCK_MESSAGES.filter(m => m.assignment_id === assignment.id));
      setLoading(false);
    };

    fetchMessages();

    // --- REAL-TIME SUBSCRIPTION ---
    // const channel = supabase
    //   .channel(`assignment-chat-${assignment.id}`)
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'assignment_messages',
    //     filter: `assignment_id=eq.${assignment.id}`
    //   }, async (payload) => {
    //     // Fetch the new message with sender info
    //     const { data: newMessage, error } = await supabase
    //       .from('assignment_messages')
    //       .select(`*, sender_profile:profiles(first_name, last_name, avatar_url)`)
    //       .eq('id', payload.new.id)
    //       .single();
    //     if (newMessage) setMessages(prev => [...prev, newMessage]);
    //   })
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };

  }, [assignment.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    // --- MOCK SEND ---
    const mockNewMessage: AssignmentMessage = {
      id: Math.random(),
      created_at: new Date().toISOString(),
      assignment_id: assignment.id,
      sender_id: adminUser.id,
      content: content,
      sender_profile: { first_name: 'Admin', last_name: 'User', avatar_url: null }
    };
    setMessages(prev => [...prev, mockNewMessage]);
    setSending(false);

    // --- REAL SEND ---
    // const { error } = await supabase
    //   .from('assignment_messages')
    //   .insert({
    //     assignment_id: assignment.id,
    //     sender_id: adminUser.id,
    //     content: content
    //   });
    // if (error) {
    //   console.error('Error sending message:', error);
    //   setNewMessage(content); // Put text back on error
    // }
    // setSending(false);
  };

  return (
    <Card title="Project Chat" className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
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