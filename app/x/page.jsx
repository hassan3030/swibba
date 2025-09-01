"use client";
import { useState } from "react";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input },
        ],
      }),
    });

    const data = await res.json();
    setReply(data.text);
  }

  return (
    <div className="p-4">
      <input
        className="border p-2 mr-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me something..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2">
        Send
      </button>
      <div className="mt-4">{reply}</div>
    </div>
  );
}
