import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessages } from "./services/api.js";
import { socket } from "./services/socket.js";
import ChatHeader from "./components/ChatHeader.jsx";
import MessageBubble from "./components/MessageBubble.jsx";
import MessageInput from "./components/MessageInput.jsx";

function getStoredUsername() {
  return localStorage.getItem("chat_username") || "";
}

export default function App() {
  const [username, setUsername] = useState(getStoredUsername);
  const [draftUsername, setDraftUsername] = useState(getStoredUsername);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);

      try {
        const history = await fetchMessages();
        setMessages(history);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load chat history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    if (!username) return;

    socket.connect();

    const handleConnect = () => {
      setConnected(true);
      setError("");
      socket.emit("user:join", { username });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectError = () => {
      setConnected(false);
      setError("Unable to connect to the chat server.");
    };

    const handleNewMessage = (message) => {
      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) {
          return current;
        }

        return [...current, message];
      });
    };

    const handleUserCount = (count) => {
      setOnlineCount(count);
    };

    const handleTyping = ({ username: typingUsername, isTyping }) => {
      setTypingUsers((current) => {
        if (isTyping && !current.includes(typingUsername)) {
          return [...current, typingUsername];
        }

        if (!isTyping) {
          return current.filter(
            (item) => item !== typingUsername
          );
        }

        return current;
      });
    };

    const handleStatus = ({ username: statusUsername, status }) => {
      if (status === "offline") {
        setTypingUsers((current) =>
          current.filter((item) => item !== statusUsername)
        );
      }
    };

    const handleSocketError = ({ message }) => {
      setError(message || "Socket error.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message:new", handleNewMessage);
    socket.on("users:count", handleUserCount);
    socket.on("typing:update", handleTyping);
    socket.on("user:status", handleStatus);
    socket.on("message:error", handleSocketError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:new", handleNewMessage);
      socket.off("users:count", handleUserCount);
      socket.off("typing:update", handleTyping);
      socket.off("user:status", handleStatus);
      socket.off("message:error", handleSocketError);
      socket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers, scrollToBottom]);

  function saveUsername(event) {
    event.preventDefault();

    const cleanUsername = draftUsername.trim();

    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    if (cleanUsername.length > 30) {
      setError("Username must be 30 characters or fewer.");
      return;
    }

    localStorage.setItem("chat_username", cleanUsername);
    setUsername(cleanUsername);
    setError("");
  }

  function sendMessage(text) {
    if (!socket.connected) {
      setError("You are not connected to the server.");
      return;
    }

    setError("");

    socket.emit(
      "message:send",
      { text },
      (response) => {
        if (!response?.success) {
          setError(response?.message || "Could not send message.");
        }
      }
    );
  }

  function startTyping() {
    if (socket.connected) {
      socket.emit("typing:start");
    }
  }

  function stopTyping() {
    if (socket.connected) {
      socket.emit("typing:stop");
    }
  }

  if (!username) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={saveUsername}>
          <div className="brand-icon">💬</div>
          <h1>Join the chat</h1>
          <p>
            Choose a username to start sending real-time
            messages.
          </p>

          <input
            value={draftUsername}
            onChange={(event) =>
              setDraftUsername(event.target.value)
            }
            placeholder="Enter username"
            maxLength={30}
            autoFocus
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Enter Chat</button>
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="chat-card">
        <ChatHeader
          username={username}
          connected={connected}
          onlineCount={onlineCount}
        />

        {error && <div className="error banner">{error}</div>}

        <div className="messages">
          {loading ? (
            <div className="empty-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.username === username}
              />
            ))
          )}

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <MessageInput
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
          disabled={!connected}
        />
      </section>
    </main>
  );
}
