"use client";
import { useState, useEffect, useCallback } from "react";

const NAV = [
  ["🏠 Home", "/home"],
  ["🗺️ Map", "/map"],
  ["💬 Messages", "/messages"],
  ["📍 History", "/history"],
  ["⚙️ Settings", "/settings"],
];

function Toggle({ checked, onChange, color = "#2563EB" }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        background: checked ? color : "rgba(255,255,255,0.1)",
        position: "relative",
        cursor: "pointer",
        transition: "all .25s",
        flexShrink: 0,
        border: `1px solid ${checked ? color : "rgba(255,255,255,0.15)"}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "24px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left .25s",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const stored = localStorage.getItem("ourlink_user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    setDisplayName(u.displayName || "");
    setPhoneNumber(u.phoneNumber || "");
    setEmail(u.email || "");
    setStatusMessage(u.statusMessage || "");
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/privacy/get?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setPrivacySettings(d.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const res = await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            displayName,
            phoneNumber,
            email,
            statusMessage,
          }),
        });
        if (res.ok) {
          const updated = {
            ...user,
            displayName,
            phoneNumber,
            email,
            statusMessage,
          };
          localStorage.setItem("ourlink_user", JSON.stringify(updated));
          setUser(updated);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } catch {
      } finally {
        setSaving(false);
      }
    },
    [user, displayName, phoneNumber, email, statusMessage],
  );

  const handleTogglePrivacy = useCallback(
    async (setting, value) => {
      if (!user) return;
      try {
        const res = await fetch("/api/privacy/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, [setting]: value }),
        });
        if (res.ok) setPrivacySettings((p) => ({ ...p, [setting]: value }));
      } catch {}
    },
    [user],
  );

  const isMarc = user?.username === "MARC";
  const myColor = isMarc ? "#2563EB" : "#EC4899";

  if (loading || !user)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
        }}
      >
        <span style={{ color: "#64748B" }}>Loading…</span>
      </div>
    );

  const sections = [
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "privacy", icon: "🔒", label: "Privacy" },
    { id: "about", icon: "ℹ️", label: "About" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        fontFamily: "Inter,system-ui,sans-serif",
        color: "#F1F5F9",
      }}
    >
      <style>{`
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;margin-bottom:20px}
        .inp{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:#F1F5F9;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box;transition:border-color .2s}
        .inp:focus{border-color:${myColor}80}
        .inp::placeholder{color:#334155}
        .privacy-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
        .privacy-row:last-child{border-bottom:none}
        .save-btn{width:100%;padding:14px;border-radius:14px;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
        .section-tab{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:500;transition:all .2s;border:none;background:transparent;color:#64748B;font-family:inherit}
        .section-tab.active{background:rgba(37,99,235,0.18);color:#60A5FA}
        .section-tab:hover{background:rgba(255,255,255,0.06);color:#94A3B8}
      `}</style>

      {/* Navbar */}
      <nav
        style={{
          background: "rgba(15,23,42,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>💑</span>
            <span
              style={{
                fontWeight: "800",
                fontSize: "20px",
                background: "linear-gradient(135deg,#2563EB,#EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OurLink
            </span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {NAV.map(([l, h]) => (
              <a
                key={h}
                href={h}
                style={{
                  color: h === "/settings" ? "#60A5FA" : "#64748B",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  background:
                    h === "/settings" ? "rgba(37,99,235,0.18)" : "transparent",
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <a
            href="/home"
            style={{
              fontSize: "13px",
              color: "#64748B",
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </a>
        </div>
      </nav>

      <div
        style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}
      >
        {saved && (
          <div
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "14px",
              padding: "12px 20px",
              marginBottom: "20px",
              color: "#86EFAC",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✅ Profile saved successfully!
          </div>
        )}

        {/* Section Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`section-tab${activeSection === s.id ? " active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="card">
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#F1F5F9",
                margin: "0 0 24px",
              }}
            >
              👤 Profile Settings
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${myColor}dd,${myColor})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  boxShadow: `0 8px 28px ${myColor}40`,
                  flexShrink: 0,
                }}
              >
                {isMarc ? "👨" : "👩"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#F1F5F9",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {user.displayName}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                    marginTop: "4px",
                    fontWeight: "500",
                  }}
                >
                  {user.username} · Member since{" "}
                  {new Date(user.created_at || Date.now()).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" },
                  )}
                </div>
                {user.statusMessage && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                      marginTop: "6px",
                    }}
                  >
                    "{user.statusMessage}"
                  </div>
                )}
              </div>
            </div>
            <form
              onSubmit={handleUpdateProfile}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {[
                {
                  label: "Display Name",
                  value: displayName,
                  setter: setDisplayName,
                  placeholder: "Your name",
                  type: "text",
                  required: true,
                },
                {
                  label: "Phone Number",
                  value: phoneNumber,
                  setter: setPhoneNumber,
                  placeholder: "e.g. +63 912 345 6789",
                  type: "tel",
                },
                {
                  label: "Email",
                  value: email,
                  setter: setEmail,
                  placeholder: "your@email.com",
                  type: "email",
                },
                {
                  label: "Status Message",
                  value: statusMessage,
                  setter: setStatusMessage,
                  placeholder: "What's on your mind?",
                  type: "text",
                },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#94A3B8",
                      display: "block",
                      marginBottom: "6px",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                    className="inp"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="save-btn"
                style={{
                  background: saving
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg,${myColor},${myColor}cc)`,
                  color: saving ? "#475569" : "#fff",
                  boxShadow: saving ? "none" : `0 8px 24px ${myColor}40`,
                  cursor: saving ? "not-allowed" : "pointer",
                  marginTop: "8px",
                }}
              >
                {saving ? "Saving…" : "💾 Save Profile"}
              </button>
            </form>
          </div>
        )}

        {/* Privacy Section */}
        {activeSection === "privacy" && privacySettings && (
          <div className="card">
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#F1F5F9",
                margin: "0 0 8px",
              }}
            >
              🔒 Privacy Settings
            </h2>
            <p
              style={{ fontSize: "13px", color: "#475569", margin: "0 0 24px" }}
            >
              Control what your partner can see about you
            </p>
            {[
              {
                icon: "📍",
                label: "Location Sharing",
                desc: "Share your live GPS location with partner",
                key: "location_sharing_enabled",
                apiKey: "locationSharingEnabled",
                invert: false,
              },
              {
                icon: "👻",
                label: "Invisible Mode",
                desc: "Hide your online status completely",
                key: "invisible_mode",
                apiKey: "invisibleMode",
                invert: false,
              },
              {
                icon: "🕐",
                label: "Hide Last Seen",
                desc: "Don't show when you were last active",
                key: "hide_last_seen",
                apiKey: "hideLastSeen",
                invert: false,
              },
              {
                icon: "✓✓",
                label: "Read Receipts",
                desc: "Show when you've read messages",
                key: "disable_read_receipts",
                apiKey: "disableReadReceipts",
                invert: true,
              },
              {
                icon: "⌨️",
                label: "Typing Indicator",
                desc: "Show when you're composing a message",
                key: "disable_typing_indicator",
                apiKey: "disableTypingIndicator",
                invert: true,
              },
            ].map((s) => (
              <div key={s.key} className="privacy-row">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#E2E8F0",
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        marginTop: "2px",
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                </div>
                <Toggle
                  checked={
                    s.invert
                      ? !privacySettings[s.key]
                      : !!privacySettings[s.key]
                  }
                  onChange={() =>
                    handleTogglePrivacy(
                      s.apiKey,
                      s.invert
                        ? !!privacySettings[s.key]
                        : !privacySettings[s.key],
                    )
                  }
                  color={myColor}
                />
              </div>
            ))}
          </div>
        )}

        {/* About Section */}
        {activeSection === "about" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>💑</div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "800",
                margin: "0 0 8px",
                background: "linear-gradient(135deg,#2563EB,#EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OurLink
            </h2>
            <p
              style={{
                color: "#64748B",
                fontSize: "15px",
                marginBottom: "28px",
              }}
            >
              Made exclusively for Marc & Malyn ❤️
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                maxWidth: "400px",
                margin: "0 auto 28px",
              }}
            >
              {[
                ["Version", "1.0.0"],
                ["Users", "Marc & Malyn"],
                ["Location updates", "Every 5s"],
                ["Message history", "Unlimited"],
                ["Location history", "30 days"],
                ["Security", "Encrypted"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "12px",
                    padding: "14px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      marginBottom: "4px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#F1F5F9",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "13px", color: "#334155" }}>
              🔒 Private & secure. No third parties. Ever.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
