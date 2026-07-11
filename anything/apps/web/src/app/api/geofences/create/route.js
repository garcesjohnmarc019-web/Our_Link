import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, name, latitude, longitude, radiusMeters } =
      await request.json();

    if (
      !userId ||
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      !radiusMeters
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO geofences (user_id, name, latitude, longitude, radius_meters, created_at)
      VALUES (${userId}, ${name}, ${latitude}, ${longitude}, ${radiusMeters}, NOW())
      RETURNING id, user_id, name, latitude, longitude, radius_meters, created_at
    `;

    return Response.json({ success: true, geofence: result[0] });
  } catch (error) {
    console.error("Create geofence error:", error);
    return Response.json(
      { error: "Failed to create geofence" },
      { status: 500 },
    );
  }
}
