"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/utils/useChat";

const NAV = [
  ["🏠 Home", "/home"],
  ["🗺️ Map", "/map"],
  ["💬 Messages", "/messages"],
  ["📍 History", "/history"],
  ["⚙️ Settings", "/settings"],
];

function fmtMsgTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

useEffect(() => {
  const stored = localStorage.getItem("ourlink_user");
  console.log("DEBUG: Laman ng localStorage:", stored);
  
  if (!stored) { window.location.href = "/"; return; }
  
  const parsedUser = JSON.parse(stored);
  console.log("DEBUG: Parsed User object:", parsedUser);
  setUser(parsedUser);
}, []);

  const { messages, sendMessage } = useChat("room-1");

  const isMarc = user?.username?.toUpperCase() === "MARC";
  const partnerName = isMarc ? "Malyn" : "Marc";
  const partnerColor = isMarc ? "#EC4899" : "#2563EB";

 const handleSend = async (e) => {
    e.preventDefault();
    
    // GAMITIN ANG USERNAME BILANG FALLBACK ID
    const userId = user?.id || user?.username; 

    if (!userId || !newMessage.trim()) {
      console.error("Hindi makapag-send: Walang User ID o Username!");
      return;
    }
    
    await sendMessage(newMessage, userId);
    setNewMessage("");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0F172A", color: "#F1F5F9" }}>
      
      {/* NAVBAR */}
      <nav style={{ background: "#1E293B", padding: "12px 20px", display: "flex", gap: "20px", borderBottom: "1px solid #334155" }}>
        {NAV.map(([label, path]) => (
          <a key={path} href={path} style={{ color: "#94A3B8", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
            {label}
          </a>
        ))}
      </nav>

      {/* CHAT HEADER */}
      <div style={{ padding: "16px", background: "#0A1628", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #334155" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: partnerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          {partnerName[0]}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>{partnerName}</div>
          <div style={{ fontSize: "12px", color: "#10B981" }}>● Online</div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {messages.map((msg) => {
  const isMe = String(msg.sender_id).toUpperCase() === String(user?.username).toUpperCase();
  
  // DITO ANG PAGBABAGO:
  // Palaging i-check ang sender_id para sa kulay, hindi ang isMe status.
  const senderName = String(msg.sender_id).toUpperCase();
  const bubbleColor = senderName === "MARC" ? "#3B82F6" : "#EC4899"; // MARC = Blue, MALYN = Pink

  return (
    <div key={msg.id} style={{ 
      display: "flex", 
      alignItems: "flex-end", 
      justifyContent: isMe ? "flex-end" : "flex-start", 
      marginBottom: "12px", 
      gap: "8px" 
    }}>
      {!isMe && (
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: bubbleColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
          {senderName[0]}
        </div>
      )}
      
      <div style={{ 
        maxWidth: "75%", 
        padding: "12px 16px", 
        borderRadius: "18px", 
        background: bubbleColor, // Ang kulay ay nakabase na sa sender
        color: "#fff" 
      }}>
        <p style={{ margin: 0, fontSize: "14px" }}>{msg.content}</p>
        <div style={{ fontSize: "9px", opacity: 0.6, marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
          {fmtMsgTime(msg.created_at)}
        </div>
      </div>
    </div>
  );
})}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSend} style={{ padding: "16px", background: "#0A1628", display: "flex", gap: "10px" }}>
  <input 
    value={newMessage} 
    onChange={(e) => setNewMessage(e.target.value)} 
    placeholder="Type a message..." 
    style={{ flex: 1, padding: "12px", borderRadius: "24px", background: "#1E293B", border: "1px solid #334155", color: "#fff" }}
  />
  <button type="submit" style={{ padding: "10px 20px", borderRadius: "20px", background: "#3B82F6", color: "#fff", border: "none", cursor: "pointer" }}>
    Send
  </button>
</form>
    </div>
  );
}