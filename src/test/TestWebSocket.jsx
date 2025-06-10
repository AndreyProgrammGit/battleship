import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function TestWebSocket() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('🔌 Connected:', socket.id);
      socket.emit('ping', { msg: 'hello from React!' });
    });

    socket.on('pong', (data) => {
      console.log('📨 Received:', data);
      setMessages((prev) => [...prev, `Server: ${data.msg}`]);
    });

    return () => {
      socket.off('connect');
      socket.off('pong');
    };
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h2>WebSocket Test</h2>
      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
}
