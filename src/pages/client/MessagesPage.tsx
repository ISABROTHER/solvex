// src/pages/client/MessagesPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../features/auth/AuthProvider';
import { Loader2, Send, MessageSquare, XCircle, Package, ArrowLeft } from 'lucide-react';
import { Database } from '../../lib/supabase/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '../../contexts/ToastContext'; // Import useToast

// Define types
type ClientProject = Database['public']['Tables']['client_projects']['Row'];
type ProjectMessage = Database['public']['Tables']['project_messages']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'first_name' | 'last_name' | 'avatar_url'> | null;
};
type ProjectWithLastMessage = ClientProject & {
  last_message: { content: string | null; created_at: string | null; };
};

// --- Left Panel: Conversation/Project List ---
interface ConversationListProps {
  onSelectProject: (projectId: string | null) => void;
  selectedProjectId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectProject, selectedProjectId }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch projects and their last message
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // This is an RPC function we need to create in Supabase
    // For now, let's just fetch projects, and we'll add last message later
    // TODO: Create RPC `get_projects_with_last_message`
    
    // Simple fetch:
    // --- THIS WAS THE BROKEN LINE ---
    const { data, error } = await supabase
      .from('client_projects')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      // Manually add a placeholder last_message
      const projectsWithEmptyMessage: ProjectWithLastMessage[] = data.map(p => ({
        ...p,
        last_message: { content: 'Click to view messages', created_at: null }
      }));
      setProjects(projectsWithEmptyMessage);
      // In a real scenario, we'd fetch the last message.
      // For now, this is fine.
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-sm">Error: {error}</div>;
  }
  
  if (projects.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        No projects found. Messages will appear here once you have a project.
      </div>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              onClick={() => onSelectProject(project.id)}
              className={`w-full text-left p-4 hover:bg-gray-50 ${
                selectedProjectId === project.id ? 'bg-orange-100' : ''
              }`}
            >
              <h4 className="font-semibold text-gray-800">{project.title}</h4>
              <p className="text-sm text-gray-500 truncate">
                {project.last_message.content}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// --- Right Panel: Chat Window ---
interface ChatWindowProps {
  projectId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ projectId }) => {
  const { user, profile } = useAuth();
  const { addToast } = useToast(); // Get addToast
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all messages for the selected project
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('project_messages')
        .select('*, profiles(first_name, last_name, avatar_url)') // Join with profiles
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data as ProjectMessage[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Initial fetch and scroll
  useEffect(() => {
    if (projectId) {
      fetchMessages();
    }
  }, [projectId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId) return;

    // Unsubscribe from old channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Subscribe to new channel
    const channel = supabase
      .channel(`project_messages_${projectId}`)
      .on<ProjectMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          // Need to fetch profile data for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', payload.new.sender_id!)
            .single();

          const newMessageWithProfile = {
            ...payload.new,
            profiles: profileData,
          } as ProjectMessage;

          setMessages((currentMessages) => [...currentMessages, newMessageWithProfile]);
        }
      )
      .subscribe();
      
    channelRef.current = channel;

    // Cleanup
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [projectId]);

  // Handle sending a message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const { error: insertError } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: user.id,
          content: newMessage.trim(),
        });
      
      if (insertError) throw insertError;
      setNewMessage(''); // Clear input on success
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Send Failed', message: err.message });
    } finally {
      setIsSending(false);
    }
  };
  
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        {!isLoading && error && (
          <div className="text-center text-red-500">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            Error loading messages: {error}
          </div>
        )}
        {!isLoading && !error && messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const senderName = isMe 
            ? 'You' 
            : `${msg.profiles?.first_name || 'SolveX'} ${msg.profiles?.last_name || 'Team'}`;
          
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-medium text-gray-600">
                {isMe ? getInitials(profile?.first_name, profile?.last_name) : getInitials(msg.profiles?.first_name, msg.profiles?.last_name)}
              </div>
              <div className="max-w-xs md:max-w-md">
                <div
                  className={`px-4 py-3 rounded-lg ${
                    isMe
                      ? 'bg-[#FF5722] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'} block`}>
                  {senderName} • {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {error && !isSending && (
           <p className="text-xs text-red-500 mb-2">Error: {error}. Please try again.</p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#FF5722] text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const MessagesPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 hidden sm:block">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      </header>
      
      {/* Main Chat Layout */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden h-[75vh]">
        <div className="flex h-full">
          {/* Mobile view: Show only one panel at a time */}
          <div className={`w-full h-full lg:hidden ${selectedProjectId ? 'hidden' : 'block'}`}>
             <ConversationList 
               onSelectProject={setSelectedProjectId} 
               selectedProjectId={selectedProjectId}
             />
          </div>
          <div className={`w-full h-full lg:hidden ${selectedProjectId ? 'block' : 'hidden'}`}>
             {selectedProjectId && (
               <>
                 <button onClick={() => setSelectedProjectId(null)} className="p-4 flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 border-b w-full">
                   <ArrowLeft className="h-4 w-4" />
                   Back to Projects
                 </button>
                 <ChatWindow projectId={selectedProjectId} />
               </>
             )}
          </div>
          
          {/* Desktop view: Two-panel */}
          <div className="hidden lg:flex w-1/3 h-full flex-col border-r border-gray-200">
            <ConversationList 
              onSelectProject={setSelectedProjectId} 
              selectedProjectId={selectedProjectId}
            />
          </div>
          <div className="hidden lg:flex w-2/3 h-full flex-col">
            {selectedProjectId ? (
              <ChatWindow projectId={selectedProjectId} />
            ) : (
              <div className="flex flex-col h-full justify-center items-center text-center text-gray-500 p-10">
                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Select a project</h2>
                <p>Choose a project from the list to view and send messages.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;