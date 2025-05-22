import { useRef, useState } from 'react';
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

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: trimmed },
      { sender: 'system', text: 'Sorry, I do not understand.' }
    ]);

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
            <strong>{msg.sender === 'user' ? 'You' : 'System'}:</strong> {msg.text}
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
