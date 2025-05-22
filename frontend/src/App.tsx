import { useRef, useState, useEffect } from 'react';
import './App.css';

type Message = {
  sender: 'user' | 'system';
  text: string;
  error: boolean;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'system', text: 'Hello! How can I help you?', error: false },
  ]);
  const [input, setInput] = useState('');
  const output = useRef<HTMLDivElement | null>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Open a dummy WebSocket connection (echo server)
    socket.current = new WebSocket('wss://echo.websocket.org'); // echo server for testing

    socket.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (typeof data === 'object' && data.text && data.from === 'user') {
          // Message from remote system
          setMessages(prev => [...prev, { sender: 'system', text: data.text, error: false }]);
        } else {
          // Unexpected or test message (e.g. echo server)
          console.log('Unknown message format:', data);
        }
      } catch (e) {
        // Probably just a plain echo text
        console.log('Non-json message: ', event.data);
      }
    };

    socket.current.onerror = (event) => {
      console.error('WebSocket error', event);
    };

    socket.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add the user message locally immediately
    setMessages(prev => [...prev, { sender: 'user', text: trimmed, error: false }]);
    
    // Send the message to the WebSocket server
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        from: 'user',
        text: "You said: " + trimmed
      }));
    } else {
      // fallback: show dummy system reply immediately if socket closed
      setMessages(prev => [...prev, {
        sender: 'system',
        text: 'Service currently not available!',
        error: true
      }]);
    }

    setInput('');
    setTimeout(() => {
      output.current?.scrollTo({ top: output.current.scrollHeight, behavior: 'smooth' });
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
      <div ref={output} className="output">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}${msg.error ? ' error' : ''}`}
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
