import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch("http://localhost:5069/api/chatstreaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao conversar com a IA");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiMessage = "";

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
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1>Stella IA</h1>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "15px",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            {/*
            <strong>
              {msg.role === "user" ? "Você" : "IA"}
            </strong>
            */}

            <div
              style={{
                marginTop: "5px",
                padding: "10px",
                display: "inline-block",
                borderRadius: "10px",
                background:
                  msg.role === "user" ? "#007bff" : "#eee",
                color:
                  msg.role === "user" ? "white" : "black",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0 25px",
            border: "none",
            borderRadius: "8px",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}