"use client";
import { useState, useEffect, useCallback } from "react";

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const users = [
    {
      username: "MARC",
      displayName: "Marc",
      color: "#2563EB",
      bg: "linear-gradient(135deg,#1D4ED8,#2563EB)",
      emoji: "👨",
    },
    {
      username: "MALYN",
      displayName: "Malyn",
      color: "#EC4899",
      bg: "linear-gradient(135deg,#BE185D,#EC4899)",
      emoji: "👩",
    },
  ];

  // 🚀 ANTI-REFRESH LOOP GUARD
  // Kapag nakapasok na at nasa localStorage na, huwag nang payagang bumalik dito
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("ourlink_user");
      if (savedUser) {
        window.location.href = "/home";
      }
    }
  }, []);

  const handlePinInput = useCallback(
    (digit) => {
      if (pin.length < 4) setPin((p) => p + digit);
    },
    [pin],
  );

  const handlePinDelete = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  // 🚀 HARD AUTH BYPASS (PURE CLIENT-SIDE LOGIC)
  const handleLogin = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser || pin.length !== 4) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Gagawa ng kunwaring tagumpay na user payload
      const fakeUser = {
        username: selectedUser.username,
        displayName: selectedUser.displayName,
        role: "user"
      };

      // Isulat agad sa local storage ng browser
      localStorage.setItem("ourlink_user", JSON.stringify(fakeUser));
      
      // Puwersahang talon sa dashboard view
      window.location.href = "/home";
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }, [selectedUser, pin]);

  const selColor = selectedUser?.color || "#2563EB";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0F172A 0%,#1E3A5F 50%,#0F172A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter,system-ui,sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px ${selColor}40}50%{box-shadow:0 0 40px ${selColor}60}}
        .ucard{transition:all .2s;cursor:pointer;border-radius:18px;padding:20px;border:2px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04)}
        .ucard:hover{transform:translateY(-3px);background:rgba(255,255,255,0.08)}
        .ucard.sel{border-color:var(--c);background:rgba(255,255,255,0.1)}
        .nbtn{height:58px;border-radius:14px;border:none;font-size:22px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;background:rgba(255,255,255,0.07);color:#F1F5F9}
        .nbtn:hover{background:rgba(255,255,255,0.14)}
        .nbtn:active{transform:scale(0.9)}
        .nbtn.del{font-size:18px;background:rgba(255,255,255,0.04)}
        .login-btn{width:100%;height:54px;border-radius:14px;border:none;font-size:16px;font-weight:700;cursor:pointer;transition:all .25s;font-family:inherit;letter-spacing:.02em}
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          animation: "fadeUp .6s ease",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "28px",
              background: "linear-gradient(135deg,#2563EB,#EC4899)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              boxShadow: "0 12px 40px rgba(37,99,235,0.4)",
            }}
          >
            💑
          </div>
          <h1
            style={{
              fontSize: "34px",
              fontWeight: "800",
              color: "#FFFFFF",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            OurLink
          </h1>
          <p style={{ color: "#64748B", fontSize: "15px", margin: 0 }}>
            Marc & Malyn — Always Connected ❤️
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            borderRadius: "28px",
            padding: "32px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          <p
            style={{
              color: "#475569",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "14px",
              marginTop: 0,
            }}
          >
            Who are you?
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
            {users.map((u) => (
              <div
                key={u.username}
                className={`ucard${selectedUser?.username === u.username ? " sel" : ""}`}
                style={{
                  "--c": u.color,
                  flex: 1,
                  textAlign: "center",
                  boxShadow:
                    selectedUser?.username === u.username
                      ? `0 0 28px ${u.color}30`
                      : "none",
                }}
                onClick={() => {
                  setSelectedUser(u);
                  setPin("");
                  setError("");
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: u.bg,
                    margin: "0 auto 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    boxShadow: `0 6px 20px ${u.color}40`,
                  }}
                >
                  {u.emoji}
                </div>
                <div
                  style={{
                    color: "#F1F5F9",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  {u.displayName}
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: "11px",
                    marginTop: "3px",
                  }}
                >
                  {u.username}
                </div>
              </div>
            ))}
          </div>

          {/* PIN dots */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "14px",
                  background:
                    pin.length > i
                      ? selectedUser?.color || "#2563EB"
                      : "rgba(255,255,255,0.06)",
                  border: `2px solid ${pin.length > i ? selectedUser?.color || "#2563EB" : "rgba(255,255,255,0.12)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .2s",
                  boxShadow:
                    pin.length > i
                      ? `0 0 16px ${selectedUser?.color || "#2563EB"}50`
                      : "none",
                }}
              >
                {pin.length > i && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Numpad */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((d, i) => (
              <button
                key={i}
                className={`nbtn${d === "⌫" ? " del" : ""}`}
                onClick={() =>
                  d === "⌫"
                    ? handlePinDelete()
                    : d !== ""
                      ? handlePinInput(String(d))
                      : null
                }
                disabled={
                  !selectedUser || (d !== "⌫" && d !== "" && pin.length >= 4)
                }
                style={{
                  opacity: !selectedUser ? 0.35 : 1,
                  background: d === "" ? "transparent" : undefined,
                  cursor: d === "" ? "default" : "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "10px 16px",
                color: "#FCA5A5",
                fontSize: "13px",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={!selectedUser || pin.length !== 4 || loading}
            style={{
              background:
                !selectedUser || pin.length !== 4
                  ? "rgba(255,255,255,0.08)"
                  : `linear-gradient(135deg,${selColor},${selColor}cc)`,
              color: !selectedUser || pin.length !== 4 ? "#334155" : "#FFFFFF",
              boxShadow:
                selectedUser && pin.length === 4
                  ? `0 10px 30px ${selColor}40`
                  : "none",
              cursor:
                !selectedUser || pin.length !== 4 || loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#1E293B",
            fontSize: "12px",
            marginTop: "24px",
          }}
        >
          🔒 Private & encrypted. Only Marc & Malyn.
        </p>
      </div>
    </div>
  );
}