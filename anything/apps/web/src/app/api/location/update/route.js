import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      userId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      batteryLevel,
    } = await request.json();

    if (!userId || latitude === undefined || longitude === undefined) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update current location (upsert)
    await sql`
      INSERT INTO user_locations (user_id, latitude, longitude, speed, heading, accuracy, battery_level, timestamp)
      VALUES (${userId}, ${latitude}, ${longitude}, ${speed || null}, ${heading || null}, ${accuracy || null}, ${batteryLevel || null}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        latitude = ${latitude},
        longitude = ${longitude},
        speed = ${speed || null},
        heading = ${heading || null},
        accuracy = ${accuracy || null},
        battery_level = ${batteryLevel || null},
        timestamp = NOW()
    `;

    // Insert into location history
    await sql`
      INSERT INTO location_history (user_id, latitude, longitude, speed, heading, accuracy, battery_level, timestamp)
      VALUES (${userId}, ${latitude}, ${longitude}, ${speed || null}, ${heading || null}, ${accuracy || null}, ${batteryLevel || null}, NOW())
    `;

    // Clean up old history (older than 30 days)
    await sql`
      DELETE FROM location_history 
      WHERE timestamp < NOW() - INTERVAL '30 days'
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Location update error:", error);
    return Response.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}
