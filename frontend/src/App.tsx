// ----- defines logic for page -----

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

type Message = {
    m_sender: "user" | "system";
    m_text: string;
    m_error: boolean;
};

// region app
function App() {
    // function to handle/display messages, collects them in "messages" list and uses classes defined in App.css to
    // display them
    const [messages, setMessages] = useState<Message[]>([
        {
            m_sender: "system",
            m_text: "Hello! How can I help you?",
            m_error: false,
        }, // initial message
    ]);
    const [input, setInput] = useState("");

    // refs and states (always use "use..." for DOM elements as these get rerendered)
    const output = useRef<HTMLDivElement | null>(null);
    const socket = useRef<Socket | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [inputIsEmpty, setInputIsEmpty] = useState(true);
    const [dataWasEchoed, setDataWasEchoed] = useState(true);

    // execute once page is rendered
    useEffect(() => {
        // define socket
        socket.current = io("http://localhost:5001", {
            reconnectionAttempts: 5,
            transports: ["websocket"],
        });

        // define socket events
        socket.current.on("connect", () => {
            console.log("Socket.IO connected, id:", socket.current?.id);
        });

        socket.current.on("message", (data) => {
            // differentiate between messages from the user (JSON) from the socket (non-JSON)
            console.log(typeof data);
            if (
                (typeof data === "object") && data.text && data.from === "user"
            ) {
                // display message
                setMessages(
                    (prev) => [...prev, {
                        m_sender: "system",
                        m_text: data.text,
                        m_error: false,
                    }],
                );

                // enable button again
                setDataWasEchoed(true);
                setInputIsEmpty(true);
                setLoading(false);

                if (buttonRef.current) {
                    buttonRef.current.style.backgroundColor = "#0066cc";
                    buttonRef.current.style.color = "#0066cc";
                }
            } else {
                console.log("Data of unknown message format:", data);
            }
        });

        socket.current.on("connect_error", (err) => {
            console.error("Connection error:", err);
        });

        socket.current.on("disconnect", () => {
            console.log("Socket.IO disconnected");
        });

        // cleanup on unrender
        return () => {
            socket.current?.disconnect();
        };
    }, []);

    // function to handle messages
    const sendMessage = () => {
        if (!inputIsEmpty && dataWasEchoed) {
            // disable button
            setLoading(true);
            setDataWasEchoed(false);

            if (buttonRef.current) {
                buttonRef.current.style.backgroundColor = "grey";
                buttonRef.current.style.color = "grey";
            }

            // display user message immediately
            const trimmed = input.trim();
            if (!trimmed) return;

            setMessages(
                (prev) => [...prev, {
                    m_sender: "user",
                    m_text: trimmed,
                    m_error: false,
                }],
            );

            // send message to the websocket
            if (socket.current && socket.current.connected) {
                socket.current.send({ // send JSON message to the socket (not of Message type!)
                    from: "user",
                    text: trimmed,
                });
            } else {
                // show error immediately if socket closed
                setMessages((prev) => [...prev, {
                    m_sender: "system",
                    m_text: "Service currently not available!",
                    m_error: true,
                }]);
            }

            // clear input field
            setInput("");

            // scroll to the bottom of output area
            setTimeout(() => {
                output.current?.scrollTo({
                    top: output.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 0);
        }
    };

    // function to handle enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // region ui
    // define actual page layout using classes from App.css
    return (
        // define page
        <div className="container">
            <div className="banner">ComplianceGPT</div>

            {/* define output area */}
            <div ref={output} className="output">
                {messages.map((msg, index) => ( // map messages to message ui elements
                    <div
                        key={index}
                        className={`message ${msg.m_sender}${
                            msg.m_error ? " error" : ""
                        }`} // define message type
                    >
                        {msg.m_text} {/* display message */}
                    </div>
                ))}
            </div>

            {/* define loading animation */}
            {loading && <div className="loader"></div>}

            {/* define input area */}
            <div className="input-area">
                <textarea
                    value={input}
                    onChange={(e) => {
                        const value = e.target.value;
                        setInput(value);
                        if (value.trim().length > 0) {
                            setInputIsEmpty(false);
                        } else {
                            setInputIsEmpty(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type..."
                />
                <button
                    disabled={inputIsEmpty || !dataWasEchoed}
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

// export page to be used by other files
export default App;
