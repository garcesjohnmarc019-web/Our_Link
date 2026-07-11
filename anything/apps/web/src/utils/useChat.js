import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);

  // 1. Fetch initial messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
  fetchMessages();

  console.log("Subscribing to channel for room:", chatId); // DEBUG

  const channel = supabase
    .channel('room-' + chatId) // Baguhin ang channel name para maging unique
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `chat_id=eq.${chatId}` 
    }, (payload) => {
      console.log("MAY NATANGGAP NA MESSAGE:", payload.new); // DEBUG
      setMessages((prev) => [...prev, payload.new]);
    })
    .subscribe((status) => {
      console.log("Subscription status:", status); // DEBUG: Dapat mag-log ito ng 'SUBSCRIBED'
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [chatId]);

  // 3. Send message function (Inalis ang 'reply_to_message_id' para hindi mag-error)
  const sendMessage = async (content, senderId) => {
    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          chat_id: chatId, 
          sender_id: senderId, 
          content: content 
        }
      ]);

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error };
    }
    return { success: true };
  };

  return { messages, sendMessage };
};