"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const NAV = [
  ["🏠 Home", "/home"],
  ["🗺️ Map", "/map"],
  ["💬 Messages", "/messages"],
  ["📍 History", "/history"],
  ["⚙️ Settings", "/settings"],
];

export default function MapPage() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [followMe, setFollowMe] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Vanilla Leaflet Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const myMarkerRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const leafletRef = useRef(null);

  // States para sa view synchronicity
  const centerRef = useRef({ lat: 14.5995, lng: 120.9842 });
  const zoomRef = useRef(13);

  // 1. Mount Validation & Core Asset Loader
  useEffect(() => {
    setIsMounted(true);

    const stored = localStorage.getItem("ourlink_user");
    if (!stored) {
      window.location.href = "/";
      return;
    }
    setUser(JSON.parse(stored));

    // Dynamic import ng CSS at Leaflet JS sa Client side lang
    import("leaflet/dist/leaflet.css").then(() => {
      import("leaflet").then((LModule) => {
        const L = LModule.default || LModule;
        leafletRef.current = L;

        if (mapContainerRef.current && !mapInstanceRef.current) {
          // I-initialize ang mapa gamit ang native Leaflet API
          const map = L.map(mapContainerRef.current, {
            center: [centerRef.current.lat, centerRef.current.lng],
            zoom: zoomRef.current,
            zoomControl: false,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

          map.on("zoomend", () => {
            zoomRef.current = map.getZoom();
          });

          mapInstanceRef.current = map;
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const isMarc = user?.username === "MARC";
  const myColor = isMarc ? "#2563EB" : "#EC4899";
  const partnerColor = isMarc ? "#EC4899" : "#2563EB";

  // Helper para sa Custom Icon Builder
  const createCustomIcon = useCallback((emoji, color) => {
    const L = leafletRef.current;
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; transform: translate(-20px, -20px);">
          <div style="background: ${color}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            ${emoji}
          </div>
        </div>
      `,
      className: "custom-leaflet-icon",
      iconSize: [40, 40],
    });
  }, []);

  // 2. Data Fetcher & Marker Updates
  const fetchLocations = useCallback(async () => {
    if (!user || !leafletRef.current || !mapInstanceRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    try {
      const res = await fetch(`/api/location/get?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok) return;

      setPartner(data.partner);

      // Handle My Location Marker
      if (data.myLocation) {
        const lat = +data.myLocation.latitude;
        const lng = +data.myLocation.longitude;
        setMyLocation({ lat, lng, ...data.myLocation });

        if (!myMarkerRef.current) {
          myMarkerRef.current = L.marker([lat, lng], {
            icon: createCustomIcon(isMarc ? "👨" : "👩", myColor),
          }).addTo(map).bindPopup(`${user.displayName} (You)`);
        } else {
          myMarkerRef.current.setLatLng([lat, lng]);
        }

        if (followMe) {
          centerRef.current = { lat, lng };
          map.setView([lat, lng], zoomRef.current);
        }
      }

      // Handle Partner Location Marker
      if (data.partner?.latitude) {
        const pLat = +data.partner.latitude;
        const pLng = +data.partner.longitude;

        if (!partnerMarkerRef.current) {
          partnerMarkerRef.current = L.marker([pLat, pLng], {
            icon: createCustomIcon(isMarc ? "👩" : "👨", partnerColor),
          }).addTo(map).bindPopup(data.partner.display_name);
        } else {
          partnerMarkerRef.current.setLatLng([pLat, pLng]);
        }
      }

      // Calculate Distance
      if (data.myLocation && data.partner?.latitude) {
        setDistance(
          calcDist(
            +data.myLocation.latitude,
            +data.myLocation.longitude,
            +data.partner.latitude,
            +data.partner.longitude,
          )
        );
      }
    } catch {}
  }, [user, followMe, isMarc, myColor, partnerColor, createCustomIcon]);

  // Sync Interval
  useEffect(() => {
    if (!isMounted) return;
    fetchLocations();
    const iv = setInterval(fetchLocations, 3000);
    return () => clearInterval(iv);
  }, [fetchLocations, isMounted]);

  // 3. Geolocation Watcher
  useEffect(() => {
    if (!isMounted || !user || !navigator.geolocation) return;
    const send = async (pos) => {
      try {
        let battery = 100;
        if (navigator.getBattery) {
          const b = await navigator.getBattery();
          battery = Math.round(b.level * 100);
        }
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
            batteryLevel: battery,
          }),
        });
        fetchLocations();
      } catch {}
    };
    const wid = navigator.geolocation.watchPosition(send, null, {
      enableHighAccuracy: true,
      maximumAge: 3000,
    });
    return () => navigator.geolocation.clearWatch(wid);
  }, [user, isMounted, fetchLocations]);

  // // Button Actions
  const handleCenterOnMe = useCallback(() => {
    if (!navigator.geolocation || !mapInstanceRef.current || !leafletRef.current) {
      alert("Geolocation is not supported or map is not ready.");
      return;
    }

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setMyLocation((p) => ({ ...p, lat, lng }));
        centerRef.current = { lat, lng };
        zoomRef.current = 16;

        if (!myMarkerRef.current) {
          myMarkerRef.current = L.marker([lat, lng], {
            icon: createCustomIcon(isMarc ? "👨" : "👩", myColor),
          }).addTo(map).bindPopup(`${user?.displayName || "You"} (You)`);
        } else {
          myMarkerRef.current.setLatLng([lat, lng]);
        }

        map.setView([lat, lng], 16);
      },
      (err) => {
        alert("Hindi makuha ang lokasyon mo. Paki-pindot ang 'Allow Location Access' sa iyong browser.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [user, isMarc, myColor, createCustomIcon]);

  const handleZoomBoth = useCallback(() => {
    if (!myLocation || !partner?.latitude || !mapInstanceRef.current) return;
    const pLat = +partner.latitude;
    const pLng = +partner.longitude;

    const midLat = (myLocation.lat + pLat) / 2;
    const midLng = (myLocation.lng + pLng) / 2;
    centerRef.current = { lat: midLat, lng: midLng };

    const d = calcDist(myLocation.lat, myLocation.lng, pLat, pLng);
    const newZoom = d > 100 ? 6 : d > 50 ? 8 : d > 20 ? 10 : d > 5 ? 12 : d > 1 ? 14 : 15;
    zoomRef.current = newZoom;

    mapInstanceRef.current.setView([midLat, midLng], newZoom);
  }, [myLocation, partner]);

  if (!isMounted || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
        <span style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>Loading Engine…</span>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0F172A", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        .mapctrl{background:rgba(15,23,42,0.92);border:1px solid rgba(255,255,255,0.1);color:#CBD5E1;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;backdrop-filter:blur(12px);white-space:nowrap}
        .mapctrl:hover{background:rgba(255,255,255,0.1);color:#F1F5F9}
        .mapctrl.on{background:#2563EB;border-color:#2563EB;color:#fff}
      `}</style>

      {/* Navbar */}
      <nav style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, zIndex: 1100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>💑</span>
            <span style={{ fontWeight: "800", fontSize: "20px", background: "linear-gradient(135deg,#2563EB,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>OurLink</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {NAV.map(([l, h]) => (
              <a key={h} href={h} style={{ color: h === "/map" ? "#60A5FA" : "#64748B", fontSize: "14px", fontWeight: "500", textDecoration: "none", padding: "7px 14px", borderRadius: "10px", background: h === "/map" ? "rgba(37,99,235,0.18)" : "transparent" }}>
                {l}
              </a>
            ))}
          </div>
          <a href="/home" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none" }}>← Dashboard</a>
        </div>
      </nav>

      {/* Map Content Viewport */}
      <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", overflow: "hidden" }}>
        
        {/* ANG AKTWAL NA MAP ELEMENT CONTAINER (PURE DOM ELEMENT) */}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", background: "#0F172A" }} />

        {/* Controls - Top Right */}
        <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 1000 }}>
          <button className={`mapctrl${followMe ? " on" : ""}`} onClick={() => setFollowMe(!followMe)}>
            {followMe ? "📍 Following Me" : "📍 Follow Me"}
          </button>
          <button className="mapctrl" onClick={handleCenterOnMe}>🎯 My Location</button>
          <button className="mapctrl" onClick={handleZoomBoth}>👫 View Both</button>
        </div>

        {/* Bottom Info Bar */}
        <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "14px 28px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "32px", zIndex: 1000, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: myColor, boxShadow: `0 0 8px ${myColor}` }} />
            <span style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "700" }}>{user?.displayName}</span>
            {myLocation && (
              <span style={{ color: "#64748B", fontSize: "12px" }}>
                🔋{myLocation.battery_level ?? 0}% · {Math.round((myLocation.speed ?? 0) * 3.6)}km/h
              </span>
            )}
          </div>
          {distance !== null && (
            <div style={{ color: "#94A3B8", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📐</span>
              <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(2)} km`} apart</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: partnerColor, boxShadow: `0 0 8px ${partnerColor}` }} />
            <span style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "700" }}>{partner?.display_name || "Partner"}</span>
            {partner && (
              <span style={{ color: "#64748B", fontSize: "12px" }}>
                🔋{partner.battery_level ?? 0}% · <span style={{ color: partner.is_online ? "#22C55E" : "#64748B" }}>●{partner.is_online ? " Online" : " Offline"}</span>
              </span>
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
    dN = ((lon2 - lon1) * Math.PI) / 180,
    a = Math.sin(dL / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}