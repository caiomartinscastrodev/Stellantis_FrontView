
import { useState } from "react";
import "./App.css"

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5069/api/chatstreaming",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao conversar com a IA");
      }

      if (!response.body) {
        throw new Error("A resposta não possui stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiMessage = "";

      // Cria a mensagem vazia da IA
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        aiMessage += chunk;

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: aiMessage,
          };

          return updated;
        });
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao tentar conversar com a IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="chat-container">

        {/* HEADER */}
        <header className="chat-header">
          <div className="brand">
            <div className="logo">
              ✦
            </div>

            <div>
              <h1>Stella IA</h1>
              <span>
                <span className="online-dot"></span>
                Online
              </span>
            </div>
          </div>
        </header>

        {/* MENSAGENS */}
        <main className="messages-container">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">
                ✦
              </div>

              <h2>Olá! Eu sou a Stella 👋</h2>

              <p>
                Como posso ajudar você hoje?
              </p>

              <div className="suggestions">
                <button
                  onClick={() =>
                    setMessage("Recebi uma carta de cobrança, e agora?")
                  }
                >
                  Recebi uma carta de cobrança.
                </button>

                <button
                  onClick={() =>
                    setMessage("O que é Gravame?")
                  }
                >
                  Gravame
                </button>

                <button
                  onClick={() =>
                    setMessage("Como faço o cadastro na área Sou Cliente?")
                  }
                >
                  Cadastro em "Sou Cliente"
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${
                msg.role === "user" ? "user-row" : "assistant-row"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="avatar">
                  ✦
                </div>
              )}

              <div
                className={`message-bubble ${
                  msg.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                {msg.content}

                {loading &&
                  msg.role === "assistant" &&
                  index === messages.length - 1 &&
                  msg.content === "" && (
                    <div className="typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </main>

        {/* INPUT */}
        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-wrapper">

            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Digite sua mensagem..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="send-button"
            >
              {loading ? "..." : "➤"}
            </button>

          </form>

          <p className="disclaimer">
            Stella IA pode cometer erros. Verifique informações importantes.
          </p>
        </div>

      </div>
    </div>
  );
}

