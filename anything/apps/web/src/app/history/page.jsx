"use client";
import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

const NAV = [
  ["🏠 Home", "/home"],
  ["🗺️ Map", "/map"],
  ["💬 Messages", "/messages"],
  ["📍 History", "/history"],
  ["⚙️ Settings", "/settings"],
];

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [history, setHistory] = useState([]);
  const [partnerHistory, setPartnerHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [viewUser, setViewUser] = useState("me");
  const [center, setCenter] = useState({ lat: 14.5995, lng: 120.9842 });
  const [zoom, setZoom] = useState(13);
  const [replayIdx, setReplayIdx] = useState(null);
  const [replaying, setReplaying] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ourlink_user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const fetchPartner = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/location/get?userId=${user.id}`);
      const data = await res.json();
      if (res.ok && data.partner) setPartner(data.partner);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchPartner();
  }, [fetchPartner]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const targetId = viewUser === "me" ? user.id : partner?.id;
      if (!targetId) return;
      const params = new URLSearchParams({
        userId: targetId,
        startDate,
        endDate,
      });
      const res = await fetch(`/api/location/history?${params}`);
      const data = await res.json();
      if (res.ok) {
        const hist = data.history || [];
        if (viewUser === "me") {
          setHistory(hist);
          setPartnerHistory([]);
        } else {
          setPartnerHistory(hist);
          setHistory([]);
        }
        if (hist.length > 0) {
          const last = hist[hist.length - 1];
          setCenter({ lat: +last.latitude, lng: +last.longitude });
          setZoom(14);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user, partner, viewUser, startDate, endDate]);

  const startReplay = useCallback(() => {
    const hist = viewUser === "me" ? history : partnerHistory;
    if (hist.length === 0) return;
    setReplayIdx(0);
    setReplaying(true);
  }, [history, partnerHistory, viewUser]);

  useEffect(() => {
    if (!replaying) return;
    const hist = viewUser === "me" ? history : partnerHistory;
    if (replayIdx === null || replayIdx >= hist.length) {
      setReplaying(false);
      setReplayIdx(null);
      return;
    }
    const pt = hist[replayIdx];
    setCenter({ lat: +pt.latitude, lng: +pt.longitude });
    const timer = setTimeout(() => setReplayIdx((i) => i + 1), 200);
    return () => clearTimeout(timer);
  }, [replaying, replayIdx, history, partnerHistory, viewUser]);

  const isMarc = user?.username === "MARC";
  const myColor = isMarc ? "#2563EB" : "#EC4899";
  const partnerColor = isMarc ? "#EC4899" : "#2563EB";

  const activeHist = viewUser === "me" ? history : partnerHistory;
  const trackColor = viewUser === "me" ? myColor : partnerColor;
  const polylinePath = activeHist.map((p) => ({
    lat: +p.latitude,
    lng: +p.longitude,
  }));
  const replayPoint =
    replayIdx !== null && activeHist[replayIdx]
      ? {
          lat: +activeHist[replayIdx].latitude,
          lng: +activeHist[replayIdx].longitude,
        }
      : null;

  // Calculate total distance
  let totalDist = 0;
  for (let i = 1; i < activeHist.length; i++) {
    totalDist += calcDist(
      +activeHist[i - 1].latitude,
      +activeHist[i - 1].longitude,
      +activeHist[i].latitude,
      +activeHist[i].longitude,
    );
  }

  if (!user)
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
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px}
        .inp{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#F1F5F9;font-size:14px;outline:none;font-family:inherit;transition:border-color .2s;width:100%;box-sizing:border-box}
        .inp:focus{border-color:#2563EB80}
        .usertab{padding:9px 20px;border-radius:10px;border:1px solid;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .fetchbtn{border:none;border-radius:12px;padding:11px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
        .replaybtn{border:none;border-radius:12px;padding:11px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff}
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
                  color: h === "/history" ? "#60A5FA" : "#64748B",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  background:
                    h === "/history" ? "rgba(37,99,235,0.18)" : "transparent",
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
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: "20px",
          }}
        >
          {/* Left Panel */}
          <div>
            {/* Controls */}
            <div className="card" style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  margin: "0 0 20px",
                }}
              >
                📍 Location History
              </h2>

              {/* User selector */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "18px" }}
              >
                <button
                  className="usertab"
                  onClick={() => setViewUser("me")}
                  style={{
                    flex: 1,
                    background: viewUser === "me" ? myColor : "transparent",
                    borderColor:
                      viewUser === "me" ? myColor : "rgba(255,255,255,0.12)",
                    color: viewUser === "me" ? "#fff" : "#64748B",
                  }}
                >
                  {isMarc ? "👨" : "👩"} {user.displayName}
                </button>
                <button
                  className="usertab"
                  onClick={() => setViewUser("partner")}
                  style={{
                    flex: 1,
                    background:
                      viewUser === "partner" ? partnerColor : "transparent",
                    borderColor:
                      viewUser === "partner"
                        ? partnerColor
                        : "rgba(255,255,255,0.12)",
                    color: viewUser === "partner" ? "#fff" : "#64748B",
                  }}
                >
                  {isMarc ? "👩" : "👨"} {partner?.display_name || "Partner"}
                </button>
              </div>

              {/* Date Range */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#64748B",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    FROM
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="inp"
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#64748B",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    TO
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="inp"
                  />
                </div>
              </div>

              {/* Quick date buttons */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "16px",
                }}
              >
                {[
                  { label: "1h", hours: 1 },
                  { label: "6h", hours: 6 },
                  { label: "Today", hours: 24 },
                  { label: "3 days", hours: 72 },
                  { label: "7 days", hours: 168 },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => {
                      const now = new Date();
                      const from = new Date(now - q.hours * 3600000);
                      setStartDate(from.toISOString().slice(0, 16));
                      setEndDate(now.toISOString().slice(0, 16));
                    }}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      color: "#94A3B8",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <button
                className="fetchbtn"
                onClick={fetchHistory}
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg,${trackColor},${trackColor}cc)`,
                  color: loading ? "#475569" : "#fff",
                }}
              >
                {loading ? "⏳ Loading…" : "🔍 Load Route"}
              </button>
            </div>

            {/* Stats */}
            {activeHist.length > 0 && (
              <div className="card" style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#94A3B8",
                    margin: "0 0 16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Route Stats
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      icon: "📍",
                      label: "Points",
                      value: activeHist.length.toLocaleString(),
                    },
                    {
                      icon: "📐",
                      label: "Distance",
                      value:
                        totalDist < 1
                          ? `${Math.round(totalDist * 1000)}m`
                          : `${totalDist.toFixed(2)}km`,
                    },
                    {
                      icon: "🕐",
                      label: "Start",
                      value: fmtShort(activeHist[0]?.timestamp),
                    },
                    {
                      icon: "🏁",
                      label: "End",
                      value: fmtShort(
                        activeHist[activeHist.length - 1]?.timestamp,
                      ),
                    },
                    {
                      icon: "🚀",
                      label: "Max Speed",
                      value: `${Math.round(Math.max(...activeHist.map((p) => (p.speed || 0) * 3.6)))}km/h`,
                    },
                    {
                      icon: "🔋",
                      label: "Battery Avg",
                      value: `${Math.round(activeHist.reduce((a, p) => a + (p.battery_level || 0), 0) / activeHist.length)}%`,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "10px",
                        padding: "12px 10px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                        {s.icon}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#F1F5F9",
                          marginBottom: "2px",
                        }}
                      >
                        {s.value}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="replaybtn"
                  onClick={startReplay}
                  disabled={replaying}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    opacity: replaying ? 0.6 : 1,
                  }}
                >
                  {replaying
                    ? `▶️ Replaying ${replayIdx + 1}/${activeHist.length}…`
                    : "▶️ Replay Route"}
                </button>
                {replaying && (
                  <button
                    onClick={() => {
                      setReplaying(false);
                      setReplayIdx(null);
                    }}
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "12px",
                      padding: "10px",
                      color: "#F87171",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ⏹️ Stop Replay
                  </button>
                )}
              </div>
            )}

            {/* History List */}
            {activeHist.length > 0 && (
              <div
                className="card"
                style={{ maxHeight: "280px", overflowY: "auto" }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#64748B",
                    margin: "0 0 12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Waypoints
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {activeHist
                    .slice()
                    .reverse()
                    .slice(0, 50)
                    .map((pt, i) => (
                      <div
                        key={pt.id}
                        onClick={() => {
                          setCenter({ lat: +pt.latitude, lng: +pt.longitude });
                          setZoom(16);
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.07)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.03)")
                        }
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#94A3B8",
                              fontWeight: "500",
                            }}
                          >
                            {fmtFull(pt.timestamp)}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#475569",
                              marginTop: "1px",
                            }}
                          >
                            {(+pt.latitude).toFixed(5)},{" "}
                            {(+pt.longitude).toFixed(5)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>
                            🔋{pt.battery_level || 0}%
                          </div>
                          <div style={{ fontSize: "11px", color: "#475569" }}>
                            🚀{Math.round((pt.speed || 0) * 3.6)}km/h
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              height: "700px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {activeHist.length === 0 && !loading ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "48px" }}>🗺️</span>
                <p style={{ color: "#475569", fontSize: "15px" }}>
                  Select a time range and click "Load Route"
                </p>
              </div>
            ) : (
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <Map
                  center={center}
                  zoom={zoom}
                  onCameraChanged={(e) => {
                    setCenter(e.detail.center);
                    setZoom(e.detail.zoom);
                  }}
                  mapId="ourlink-history"
                  style={{ width: "100%", height: "100%" }}
                  gestureHandling="greedy"
                >
                  {/* Route polyline
{polylinePath.length > 1 && (
  <Polyline
    path={polylinePath}
    strokeColor={trackColor}
    strokeWeight={4}
    strokeOpacity={0.8}
  />
)}
*/}

                  {/* Start marker */}
                  {activeHist[0] && (
                    <AdvancedMarker
                      position={{
                        lat: +activeHist[0].latitude,
                        lng: +activeHist[0].longitude,
                      }}
                    >
                      <div
                        style={{
                          background: "#22C55E",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          boxShadow: "0 3px 12px rgba(34,197,94,0.5)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🚀 Start
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* End marker */}
                  {activeHist.length > 1 && (
                    <AdvancedMarker
                      position={{
                        lat: +activeHist[activeHist.length - 1].latitude,
                        lng: +activeHist[activeHist.length - 1].longitude,
                      }}
                    >
                      <div
                        style={{
                          background: "#DC2626",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          boxShadow: "0 3px 12px rgba(220,38,38,0.5)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🏁 End
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* Replay marker */}
                  {replayPoint && (
                    <AdvancedMarker position={replayPoint}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            background: trackColor,
                            borderRadius: "50%",
                            width: "46px",
                            height: "46px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            boxShadow: `0 6px 24px ${trackColor}70`,
                            border: "3px solid #fff",
                          }}
                        >
                          {viewUser === "me"
                            ? isMarc
                              ? "👨"
                              : "👩"
                            : isMarc
                              ? "👩"
                              : "👨"}
                        </div>
                        <div
                          style={{
                            background: trackColor,
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {viewUser === "me"
                            ? user.displayName
                            : partner?.display_name}
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}
                </Map>
              </APIProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371,
    dL = ((lat2 - lat1) * Math.PI) / 180,
    dN = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtShort(ts) {
  if (!ts) return "--";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtFull(ts) {
  if (!ts) return "--";
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
