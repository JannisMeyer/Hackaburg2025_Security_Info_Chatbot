// ----- defines logic for page -----

import { useRef, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

type Message = {
  m_sender: 'user' | 'system';
  m_text: string;
  m_error: boolean;
};

// region app
function App() {

  // function to handle/display messages, collects them in "messages" list and uses classes defined in App.css to
  // display them
  const [messages, setMessages] = useState<Message[]>([
    { m_sender: 'system', m_text: 'Hello! How can I help you?', m_error: false }, // initial message
  ]);
  const [input, setInput] = useState('');

  const output = useRef<HTMLDivElement | null>(null);
  const socket = useRef<Socket | null>(null);

  // execute once page is rendered
  useEffect(() => {
    socket.current = io('http://10.8.7.46:5001', {
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    // define socket events
    socket.current.on('connect', () => {
      console.log('Socket.IO connected, id:', socket.current?.id);
    });

    socket.current.on('message', (data) => {

      // differentiate between messages from the user (JSON) from the socket (non-JSON)
      if (typeof data === 'object' && data.text && data.from === 'user') {
        setMessages(prev => [...prev, { m_sender: 'system', m_text: data.text, m_error: false }]);
      } else {
        console.log('Data of unknown message format:', data);
      }
    });

    socket.current.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    socket.current.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    // cleanup on unrender
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // function to handle messages
  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // display user message immediately
    setMessages(prev => [...prev, { m_sender: 'user', m_text: trimmed, m_error: false }]);
    
    // send message to the websocket
    if (socket.current && socket.current.connected) {
      socket.current.send({ // send JSON message to the socket (not of Message type!)
        from: 'user',
        text: "You said: " + trimmed
      });
    } else {
      // show error immediately if socket closed
      setMessages(prev => [...prev, {
        m_sender: 'system',
        m_text: 'Service currently not available!',
        m_error: true
      }]);
    }

    // clear input field
    setInput('');

    // scroll to the bottom of output area
    setTimeout(() => {
      output.current?.scrollTo({ top: output.current.scrollHeight, behavior: 'smooth' });
    }, 0);
  };

  // function to handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // region ui
  // define actual page layout using classes from App.css
  return (

    // define output area
    <div className="container">
      <div className="banner">ComplianceGPT</div>

      <div ref={output} className="output">
        {messages.map((msg, index) => ( // map messages to message ui elements
          <div
            key={index}
            className={`message ${msg.m_sender}${msg.m_error ? ' error' : ''}`} // define message type
          >
            {msg.m_text} {/* display message */}
          </div>
        ))}
      </div>

      {/* define input area */}
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)} // display input
          onKeyDown={handleKeyDown}
          placeholder="Type..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

// export page to be used by other files
export default App;
