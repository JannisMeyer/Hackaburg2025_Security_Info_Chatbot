// ----- defines logic for page -----

import { useRef, useState, useEffect } from 'react';
import './App.css';

type Message = {
  m_sender: 'user' | 'system';
  m_text: string;
  m_error: boolean;
};

function App() {

  // function to handle/display messages, collects them in "messages" list and uses classes defined in App.css to
  // display them
  const [messages, setMessages] = useState<Message[]>([
    { m_sender: 'system', m_text: 'Hello! How can I help you?', m_error: false }, // initial message
  ]);
  const [input, setInput] = useState('');

  const output = useRef<HTMLDivElement | null>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => { // code to be executed once th page is rendered
    // create a dummy web socket (echo server) for testing
    socket.current = new WebSocket('wss://echo.websocket.org');

    // define socket methods
    socket.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // parse message JSON object

        if (typeof data === 'object' && data.text && data.from === 'user') { // input message from user to be echoed
          setMessages(prev => [...prev, { m_sender: 'system', m_text: data.text, m_error: false }]);
        } else {
          console.log('Unknown message format:', data);
        }
      } catch (e) {
        console.log('Non-json message: ', event.data); // for errors or internal system messages
      }
    };

    socket.current.onerror = (event) => {
      console.error('WebSocket error: ', event);
    };

    socket.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // cleanup when page is closed
    return () => {
      socket.current?.close();
    };
  }, []);

  // function to handle messages
  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // display user message immediately
    setMessages(prev => [...prev, { m_sender: 'user', m_text: trimmed, m_error: false }]);
    
    // send message to the websocket
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ // send message to the server internally, not of Message type!
        from: 'user',
        text: "You said: " + trimmed
      }));
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
          placeholder="Type your message here..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

// export page to be used by other files
export default App;
