'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function RealtimeTest() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('test-conversation-id');

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      
      // Join the conversation room upon connect
      socket.emit('conversation:join', { conversationId });
      console.log(`Requested to join conversation: ${conversationId}`);
    });

    socket.on('message:new', (message) => {
      console.log('New message received:', message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('message:new');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [conversationId]);

  const sendMessage = () => {
    const socket = getSocket();
    if (!input.trim()) return;

    socket.emit('message:send', {
      conversationId,
      content: input,
    });
    
    setInput('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Realtime Chat Test</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Conversation ID: </label>
        <input 
          value={conversationId} 
          onChange={(e) => setConversationId(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'auto', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <strong>Sender:</strong> {msg.senderId} <br/>
            <strong>Content:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..."
          style={{ flex: 1, padding: '5px' }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: '5px 15px' }}>Send</button>
      </div>
    </div>
  );
}