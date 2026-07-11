"use client";
import { useState, useEffect, useCallback } from "react";
import { formatTimeAgo } from "../../utils/time";

const NAV = [
  ["🏠 Home", "/home"],
  ["🗺️ Map", "/map"],
  ["💬 Messages", "/messages"],
  ["📍 History", "/history"],
  ["⚙️ Settings", "/settings"],
];

function Navbar({ user, myColor, onLogout }) {
  return (
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
              letterSpacing: "-0.02em",
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
                color: h === "/home" ? "#60A5FA" : "#64748B",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                padding: "7px 14px",
                borderRadius: "10px",
                background:
                  h === "/home" ? "rgba(37,99,235,0.18)" : "transparent",
                transition: "all .2s",
              }}
            >
              {l}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: myColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {user.displayName?.[0]}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#E2E8F0",
                }}
              >
                {user.displayName}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              color: "#F87171",
              fontSize: "13px",
              padding: "6px 14px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        padding: "14px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#F1F5F9",
          marginBottom: "3px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#64748B" }}>{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  
  // 🚀 DIREKTA NANG MAY LAMANG MOCK DATA PARA HINDI NA MAG-ANTAY SA API
  const [partner, setPartner] = useState({
    display_name: "Marc",
    username: "MARC",
    status_message: "On the way na ako sa puso mo! ❤️",
    is_online: true,
    battery_level: 85,
    accuracy: 5,
    speed: 0,
    latitude: 14.5678,
    longitude: 121.0123,
    location_updated_at: new Date().toISOString()
  });

  const [myLocation, setMyLocation] = useState({
    battery_level: 99,
    accuracy: 3,
    speed: 0,
    timestamp: new Date().toISOString(),
    latitude: 14.5628,
    longitude: 121.0073
  });

  // Ang ibang states mo...
  const [distance, setDistance] = useState(1.2); // Pwede mong lagyan ng default value para makita ang UI
  const [walkTime, setWalkTime] = useState(15);
  const [driveTime, setDriveTime] = useState(5);
  const [direction, setDirection] = useState("North");
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ourlink_user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const fetchLocations = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/location/get?userId=${user.id}`);
      let data = {};
      
      if (res.ok) {
        data = await res.json();
      }

      // 1. I-setup ang Aking Lokasyon (Gamitin ang galing sa API o ang kasalukuyang local state, fallback sa default)
      const resolvedMyLocation = data.myLocation || myLocation || {
        battery_level: 99,
        accuracy: 3,
        speed: 0,
        timestamp: new Date().toISOString(),
        latitude: 14.5628,
        longitude: 121.0073
      };
      setMyLocation(resolvedMyLocation);

      // 2. I-setup ang Lokasyon ng Partner (Gamitin ang galing sa API o ang Mock Fallback)
      let resolvedPartner = data.partner;
      
      if (!resolvedPartner) {
        const isMarcLoggedIn = user.username?.toUpperCase() === "MARC";
        resolvedPartner = {
          display_name: isMarcLoggedIn ? "Malyn" : "Marc",
          username: isMarcLoggedIn ? "MALYN" : "MARC",
          status_message: "On the way na ako sa puso mo! ❤️",
          is_online: true,
          battery_level: 85,
          accuracy: 5,
          speed: 0,
          // Maglalagay ng kaunting distansya base sa resolvedMyLocation natin
          latitude: +resolvedMyLocation.latitude + 0.005,
          longitude: +resolvedMyLocation.longitude + 0.005,
          location_updated_at: new Date().toISOString()
        };
      }
      setPartner(resolvedPartner);

      // 3. Kalkulahin ang Distansya at Oras gamit ang mga niresolbang data sa itaas
      if (resolvedPartner?.latitude && resolvedMyLocation?.latitude) {
        const dist = calcDist(
          +resolvedMyLocation.latitude,
          +resolvedMyLocation.longitude,
          +resolvedPartner.latitude,
          +resolvedPartner.longitude
        );
        
        setDistance(dist);
        setWalkTime(Math.round((dist / 5) * 60));
        setDriveTime(Math.round((dist / 50) * 60));
        setDirection(
          calcDir(
            +resolvedMyLocation.latitude,
            +resolvedMyLocation.longitude,
            +resolvedPartner.latitude,
            +resolvedPartner.longitude
          )
        );
      }
    } catch (err) {
      console.error("Error fetching real database locations:", err);
    }
    // 💡 Idinagdag si myLocation dito para laging updated ang computation ng distansya mo!
  }, [user, myLocation]); 

  // Effect para sa pag-fetch ng locations mula sa API tuwing 5 segundo
  useEffect(() => {
    fetchLocations();
    const iv = setInterval(fetchLocations, 5000);
    return () => clearInterval(iv);
  }, [fetchLocations]);

  // Effect para sa Live GPS tracking (watchPosition)
  useEffect(() => {
    if (!user || !navigator.geolocation) return;

    const send = async (pos) => {
      try {
        let battery = 100;
        if (navigator.getBattery) {
          const b = await navigator.getBattery();
          battery = Math.round(b.level * 100);
        }

        const currentTimestamp = new Date().toISOString();

        // Lokal na i-update ang sariling state agad-agad para hindi mag-antay sa API response
        setMyLocation({
          battery_level: battery,
          accuracy: Math.round(pos.coords.accuracy),
          speed: Math.round(pos.coords.speed * 3.6) || 0, // Convert m/s to km/h kung may speed data
          timestamp: currentTimestamp,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });

        // I-send ang live data sa server database
        await fetch("/api/location/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed || 0,
            heading: pos.coords.heading || 0,
            accuracy: pos.coords.accuracy,
            battery_level: battery, // Ginawa nating battery_level para pareho sa get API
          }),
        });
      } catch (err) {
        console.error("Failed to send tracking data:", err);
      }
    };

    const wid = navigator.geolocation.watchPosition(send, (err) => console.error(err), {
      enableHighAccuracy: true,
      maximumAge: 0, // Inalis ang cache para 100% real-time ang hatak ng coordinates
      timeout: 10000
    });

    return () => navigator.geolocation.clearWatch(wid);
  }, [user]);
  
  const handleLogout = useCallback(async () => {
    if (!confirm("Logout of OurLink?")) return;
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch {}
    localStorage.removeItem("ourlink_user");
    window.location.href = "/";
  }, [user]);

  const handleSOS = useCallback(async () => {
    if (!navigator.geolocation) return alert("Location unavailable");
    if (!confirm("🚨 Send SOS Emergency Alert to your partner now?")) return;
    setSosLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let battery = 100;
          if (navigator.getBattery) {
            const b = await navigator.getBattery();
            battery = Math.round(b.level * 100);
          }
          await fetch("/api/sos/alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              batteryLevel: battery,
            }),
          });
          setSosSuccess(true);
          setTimeout(() => setSosSuccess(false), 5000);
        } catch {}
        setSosLoading(false);
      },
      () => setSosLoading(false),
    );
  }, [user]);

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

  const isMarc = user.username === "MARC";
  const myColor = isMarc ? "#2563EB" : "#EC4899";
  const partnerColor = isMarc ? "#EC4899" : "#2563EB";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "#F1F5F9",
        fontFamily: "Inter,system-ui,sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:26px;animation:fadeUp .4s ease}
        .card:hover{border-color:rgba(255,255,255,0.12)}
        .qbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);text-decoration:none;transition:all .2s;cursor:pointer;text-align:center}
        .qbtn:hover{transform:translateY(-4px);background:rgba(255,255,255,0.08)}
      `}</style>
      <Navbar user={user} myColor={myColor} onLogout={handleLogout} />

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        {sosSuccess && (
          <div
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "16px",
              padding: "14px 20px",
              marginBottom: "20px",
              color: "#86EFAC",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✅ SOS Alert sent! Your partner has been notified with your live GPS
            location.
          </div>
        )}

        {/* User Cards Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* My Card */}
          <div
            className="card"
            style={{
              borderColor: `${myColor}20`,
              boxShadow: `0 0 50px ${myColor}08`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${myColor}dd,${myColor})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
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
                      fontSize: "13px",
                      color: "#475569",
                      marginTop: "2px",
                      fontWeight: "500",
                    }}
                  >
                    You · {user.username}
                  </div>
                  {user.statusMessage && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                        marginTop: "4px",
                      }}
                    >
                      "{user.statusMessage}"
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(34,197,94,0.12)",
                  borderRadius: "20px",
                  padding: "5px 13px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "7px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#22C55E",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#22C55E",
                  }}
                >
                  Online
                </span>
              </div>
            </div>
            {myLocation ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "10px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <StatCard
                  icon="🔋"
                  label="Battery"
                  value={`${myLocation.battery_level ?? 0}%`}
                />
                <StatCard
                  icon="📡"
                  label="Accuracy"
                  value={`${Math.round(myLocation.accuracy ?? 0)}m`}
                />
                <StatCard
                  icon="🚀"
                  label="Speed"
                  value={`${Math.round((myLocation.speed ?? 0) * 3.6)}km/h`}
                />
                <StatCard
                  icon="🕐"
                  label="Updated"
                  value={fmtTime(myLocation.timestamp)}
                />
              </div>
            ) : (
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                Acquiring GPS…
              </div>
            )}
          </div>

          {/* Partner Card */}
          <div
            className="card"
            style={{
              borderColor: `${partnerColor}20`,
              boxShadow: `0 0 50px ${partnerColor}08`,
            }}
          >
            {partner ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg,${partnerColor}dd,${partnerColor})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        boxShadow: `0 8px 28px ${partnerColor}40`,
                        flexShrink: 0,
                      }}
                    >
                      {isMarc ? "👩" : "👨"}
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
                        {partner.display_name}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          marginTop: "2px",
                          fontWeight: "500",
                        }}
                      >
                        Partner · {partner.username}
                      </div>
                      {partner.status_message && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748B",
                            marginTop: "4px",
                          }}
                        >
                          "{partner.status_message}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: partner.is_online
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(100,116,139,0.12)",
                      borderRadius: "20px",
                      padding: "5px 13px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: partner.is_online ? "#22C55E" : "#64748B",
                        animation: partner.is_online
                          ? "pulse 2s infinite"
                          : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: partner.is_online ? "#22C55E" : "#64748B",
                      }}
                    >
                      {partner.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "10px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <StatCard
                    icon="🔋"
                    label="Battery"
                    value={`${partner.battery_level ?? 0}%`}
                  />
                  <StatCard
                    icon="📡"
                    label="Accuracy"
                    value={
                      partner.accuracy
                        ? `${Math.round(partner.accuracy)}m`
                        : "--"
                    }
                  />
                  <StatCard
                    icon="🚀"
                    label="Speed"
                    value={
                      partner?.speed != null
                        ? `${Math.round(partner.speed * 3.6)}km/h`
                        : "0km/h"
                    }
                  />
                  <StatCard
                    icon="🕐"
                    label="Last Seen"
                    value={formatTimeAgo(partner?.location_updated_at)} // Gumamit ng function para sa "Just now"
                    />
                </div>
              </>
            ) : (
              <div
                style={{
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "32px" }}>👤</span>
                <span style={{ fontSize: "14px" }}>Waiting for partner…</span>
              </div>
            )}
          </div>
        </div>

        {/* Distance Panel */}
        {distance !== null && (
          <div className="card" style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              📏 Distance Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "📐",
                  label: "Distance",
                  value:
                    distance < 1
                      ? `${Math.round(distance * 1000)} m`
                      : `${distance.toFixed(2)} km`,
                },
                {
                  icon: "🚗",
                  label: "Driving ETA",
                  value:
                    driveTime < 1
                      ? "< 1 min"
                      : driveTime > 60
                        ? `${Math.round(driveTime / 60)}h`
                        : `${driveTime} min`,
                },
                {
                  icon: "🚶",
                  label: "Walking ETA",
                  value:
                    walkTime < 1
                      ? "< 1 min"
                      : walkTime > 60
                        ? `${Math.round(walkTime / 60)}h`
                        : `${walkTime} min`,
                },
                { icon: "🧭", label: "Direction", value: direction || "--" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                    padding: "18px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#F1F5F9",
                      marginBottom: "4px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      fontWeight: "500",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              href: "/map",
              icon: "🗺️",
              label: "Live Map",
              desc: "See real-time locations",
              color: "#2563EB",
            },
            {
              href: "/messages",
              icon: "💬",
              label: "Messages",
              desc: "Private chat",
              color: "#7C3AED",
            },
            {
              href: "/history",
              icon: "📍",
              label: "History",
              desc: "30-day location replay",
              color: "#0891B2",
            },
            {
              href: "/settings",
              icon: "⚙️",
              label: "Settings",
              desc: "Profile & privacy",
              color: "#059669",
            },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="qbtn"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = a.color + "40";
                e.currentTarget.style.boxShadow = `0 8px 32px ${a.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "34px", marginBottom: "12px" }}>
                {a.icon}
              </span>
              <span
                style={{
                  fontWeight: "700",
                  fontSize: "15px",
                  color: "#F1F5F9",
                  marginBottom: "5px",
                }}
              >
                {a.label}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {a.desc}
              </span>
            </a>
          ))}
        </div>

        {/* SOS */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleSOS}
            disabled={sosLoading}
            style={{
              background: "linear-gradient(135deg,#DC2626,#991B1B)",
              border: "none",
              borderRadius: "18px",
              padding: "20px 60px",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 12px 40px rgba(220,38,38,0.45)",
              fontFamily: "inherit",
              transition: "all .2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03) translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1) translateY(0)")
            }
          >
            {sosLoading ? "📡 Sending…" : "🚨 SOS Emergency Alert"}
          </button>
          <p style={{ color: "#334155", fontSize: "12px", marginTop: "10px" }}>
            Instantly sends your GPS location, battery level & Google Maps link
          </p>
        </div>
      </div>
    </div>
  );
}

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371,
    dL = ((lat2 - lat1) * Math.PI) / 180,
    dN = ((lon2 - lon1) * Math.PI) / 180,
    a =
      Math.sin(dL / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function calcDir(lat1, lon1, lat2, lon2) {
  const dL = ((lon2 - lon1) * Math.PI) / 180,
    y = Math.sin(dL) * Math.cos((lat2 * Math.PI) / 180),
    x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dL),
    b = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(b / 45) % 8];
}
function fmtTime(ts) {
  if (!ts) return "--";
  const d = new Date(ts),
    s = Math.floor((new Date() - d) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString();
}