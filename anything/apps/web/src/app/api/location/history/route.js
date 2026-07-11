import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let history;

    if (startDate && endDate) {
      history = await sql`
        SELECT 
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          battery_level,
          timestamp
        FROM location_history
        WHERE user_id = ${userId}
          AND timestamp >= ${startDate}
          AND timestamp <= ${endDate}
        ORDER BY timestamp ASC
      `;
    } else {
      history = await sql`
        SELECT 
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          battery_level,
          timestamp
        FROM location_history
        WHERE user_id = ${userId}
          AND timestamp >= NOW() - INTERVAL '30 days'
        ORDER BY timestamp ASC
        LIMIT 10000
      `;
    }

    return Response.json({ history });
  } catch (error) {
    console.error("Get location history error:", error);
    return Response.json(
      { error: "Failed to get location history" },
      { status: 500 },
    );
  }
}
