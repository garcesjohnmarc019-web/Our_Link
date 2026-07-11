import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) { /* ... */ }
export async function POST(request) {
  try {
    // Kunin ang data mula sa frontend
    const body = await request.json();
    console.log("LOG: Natanggap na data sa API:", body);

    const { userId, latitude, longitude, batteryLevel } = body;

    // Validate kung kumpleto ang data
    if (!userId || latitude === undefined || longitude === undefined) {
      console.error("ERROR: Kulang ang required fields.");
      return Response.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // I-insert sa Supabase 'sos_alerts' table
    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([
        { 
          user_id: userId, 
          latitude: latitude, 
          longitude: longitude, 
          battery_level: batteryLevel ?? null 
        }
      ])
      .select();

    // Check kung may error sa database operation
    if (error) {
      console.error("ERROR: Supabase insert failed:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("SUCCESS: Data inserted successfully:", data);

    // Return success response
    return Response.json({
      success: true,
      data: data,
      mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
    });

  } catch (error) {
    console.error("FATAL ERROR: Hindi ma-process ang request:", error);
    return Response.json({ error: "Failed to create SOS alert" }, { status: 500 });
  }
}