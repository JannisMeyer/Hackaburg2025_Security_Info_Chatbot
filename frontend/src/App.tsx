import { useRef, useState, useEffect } from 'react';
import './App.css';

type Message = {
  sender: 'user' | 'system';
  text: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'system', text: 'Hello! How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Open a dummy WebSocket connection (echo server)
    socketRef.current = new WebSocket('wss://echo.websocket.org'); // echo server for testing

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      console.log('Received:', event.data);
    };

    socketRef.current.onerror = (event) => {
      console.error('WebSocket error', event);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add the user message locally immediately
    setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
    
    // Send the message to the WebSocket server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(trimmed);
    } else {
      // fallback: show dummy system reply immediately if socket closed
      setMessages(prev => [...prev, { sender: 'system', text: 'Sorry, I do not understand.' }]);
    }

    setInput('');
    setTimeout(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container">
      <div ref={outputRef} className="output">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
