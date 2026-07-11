import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get partner's location and info
    const results = await sql`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.profile_picture_url,
        u.is_online,
        u.last_seen,
        ul.latitude,
        ul.longitude,
        ul.speed,
        ul.heading,
        ul.accuracy,
        ul.battery_level,
        ul.timestamp,
        ul.timestamp as location_updated_at,
        ps.location_sharing_enabled,
        ps.invisible_mode
      FROM users u
      LEFT JOIN user_locations ul ON u.id = ul.user_id
      LEFT JOIN privacy_settings ps ON u.id = ps.user_id
      WHERE u.id != ${userId}
      LIMIT 1
    `;

    // Get my own location
    const myLocation = await sql`
      SELECT 
        ul.latitude,
        ul.longitude,
        ul.speed,
        ul.heading,
        ul.accuracy,
        ul.battery_level,
        ul.timestamp,
        ul.timestamp as location_updated_at
      FROM user_locations ul
      WHERE ul.user_id = ${userId}
      ORDER BY ul.timestamp DESC
      LIMIT 1
    `;

    return Response.json({
      partner: results[0] || null,
      myLocation: myLocation[0] || null,
    });
  } catch (error) {
    console.error("Get location error:", error);
    return Response.json({ error: "Failed to get location" }, { status: 500 });
  }
}