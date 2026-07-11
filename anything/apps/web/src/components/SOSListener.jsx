import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Siguraduhing tama ang URL at KEY mo (makikita ito sa Supabase dashboard > Project Settings > API)
const supabaseUrl = "https://rsnajdzebkradayzuijl.supabase.co";
const supabaseKey = "sb_publishable_dbsKg9xXvF4BLFEWsG3N7g_YVCLC67V";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function SOSListener() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel('sos-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
        setAlert(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!alert) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'red', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <h1>⚠️ EMERGENCY ALERT!</h1>
      <p>Kailangan ng tulong!</p>
      <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} target="_blank" style={{ padding: '20px', background: 'white', color: 'red', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
        Tingnan ang Lokasyon
      </a>
      <button onClick={() => setAlert(null)} style={{ marginTop: '20px' }}>Dismiss</button>
    </div>
  );
}